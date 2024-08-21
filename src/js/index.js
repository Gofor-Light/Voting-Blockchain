Index = {
  web3Provider: null,
  contracts: {},
  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      Index.web3Provider = web3.currentProvider;
    } else {
      Index.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(Index.web3Provider);
    Index.initContract();
  },
  initContract: function () {
    $.getJSON('Voting.json', function (data) {
      var Artifact = data;
      Index.contracts.Voting = TruffleContract(Artifact);
      Index.contracts.Voting.setProvider(Index.web3Provider);
    });
    Index.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-block', Index.handleSignin);
  },

  handleSignin: function () {
    var VotingInstance;
    var user_id = $("#user_id").val();//获取前端用户输入账户信息
    var frontAccount = user_id.toLowerCase();
    var RegisterStartTime;
    var VoteEndTime;
    var date = new Date();
    var month = date.getMonth() + 1;
    var time = date.getFullYear() + "-" + month + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    var timeDate = new Date(time.replace(/-/g, "\/"));
    console.log("Success! Got result: " + time);
    // 获取用户账号
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);
      Index.contracts.Voting.deployed().then(function (instance) {
        VotingInstance = instance;

        //获取RegisterStartTime
        VotingInstance.getRegisterStartTime.call({ from: account }).then((result) => {
          console.log("Success! Got result: " + result);
          RegisterStartTime = new Date(result.replace(/-/g, "\/"));

          //获取VoteEndTime
          VotingInstance.getVoteEndTime.call({ from: account }).then((result) => {
            console.log("Success! Got result: " + result);
            VoteEndTime = new Date(result.replace(/-/g, "\/"));

            //根据时间进行页面的跳转
            if (user_id == "0x4218296a5f43B918BdBD4fE118B8791e5F76154c") {//该账号设置为管理员账号
              if (account == 0x4218296a5f43B918BdBD4fE118B8791e5F76154c) {
                if (timeDate > RegisterStartTime && timeDate < VoteEndTime) {
                  window.location.href = "note.html";
                } else if (timeDate > VoteEndTime) {
                  window.location.href = "result.html";
                } else {
                  window.location.href = "project.html";
                }
              } else {
                alert("请同时用管理员账户登录Metamask");
              }
            } else {
              if (frontAccount == account) {
                if (timeDate < RegisterStartTime) {
                  alert("投票系统还未开放");
                  window.location.href = "index.html";
                }
                else if (timeDate > VoteEndTime) {
                    alert("投票已截止");
                    window.location.href = "result.html";
                }
                else {
                  VotingInstance.VaildID.call({ from: account }).then((vaildornot) => {
                    console.log("Success! Got Vote: " + vaildornot);
                    if (!vaildornot) {
                      alert("请先注册！");
                      window.location.href = "login.html";
                    }
                    else {
                      window.location.href = "vote.html";
                    }
                  }).catch((err) => {
                    console.log("Failed with error: " + err);
                  });
                }
              }
              else {
                alert("请同时用该账户登录Metamask");
              }
            }
          }).catch((err) => {
            console.log("Failed with error: " + err);
          });

        }).catch((err) => {
          console.log("Failed with error: " + err);
        });

      });
    });
  }
};

$(function () {
  $(window).load(function () {
    Index.initWeb3();
  });
});