Result = {
  web3Provider: null,
  contracts: {},

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      Result.web3Provider = web3.currentProvider;
    } else {
      Result.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(Result.web3Provider);
    Result.initContract();
  },

  initContract: function () {

    $.getJSON('Voting.json', function (data) {
      var Artifact = data;

      Result.contracts.Voting = TruffleContract(Artifact);

      Result.contracts.Voting.setProvider(Result.web3Provider);
    });
    setTimeout(() => {
       Result.isTimeToResult();
    }, 200);
   
  },

  isTimeToResult: function () {
    var Instance;
    var VoteEndTime;
    var date = new Date();
    var time = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    var timeDate = new Date(time.replace(/-/g, "\/"));
    // 获取用户账号
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      Result.contracts.Voting.deployed().then(function (instance) {
        Instance = instance;
        //get VoteEndTime
        Instance.getVoteEndTime.call({ from: account }).then((result) => {
          console.log("Success! Got result: " + result);
          VoteEndTime = new Date(result.replace(/-/g, "\/"));
          //根据时间进行页面的跳转
          if (account == 0x4218296a5f43B918BdBD4fE118B8791e5F76154c) {
            Result.handleRegister();
          }
          else {
            if (timeDate > VoteEndTime) {
              Result.handleRegister();
            }
            else {
              alert("投票还未截止！");
              window.location.href = "index.html";
            }
          }
        }).catch((err) => {
          console.log("Failed with error: " + err);
        });

      });
    });
  },

  handleRegister: function () {
    var Instance;

    // 获取用户账号
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      Result.contracts.Voting.deployed().then(function (instance) {
        Instance = instance;
        Instance.getProjectName.call({ from: account }).then((result) => {
          console.log("Success! Got result: " + result);
          var projectName = result;
          $("#projectName").html(projectName);
        }).catch((err) => {
          console.log("Failed with error: " + err);
        });

        for (var i = 0; i < 10; i++)
          //get select
          Instance.getCandidateList.call(i, { from: account }).then((result) => {
            console.log("Success! Got result: " + result);
            if(result == "")
              return;
            var select = result;
            var tb = document.getElementsByTagName('tbody');
            var trObj = document.createElement('tr');
            var tdObj1 = document.createElement('td');
            var tdObj2 = document.createElement('td');
            tdObj1.innerHTML = select;
            trObj.appendChild(tdObj1);

            //get count
            Instance.totalVotesFor.call(select, { from: account }).then((result) => {
              console.log("Success! Got result: " + result + "count");
              var count = result + " ";
              tdObj2.innerHTML = count;
              trObj.appendChild(tdObj2);
              tb[0].appendChild(trObj);
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
    Result.initWeb3();
  });
});