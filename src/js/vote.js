Vote = {
  web3Provider: null,
  contracts: {},

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      Vote.web3Provider = web3.currentProvider;
    } else {
      Vote.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(Vote.web3Provider);
    Vote.initContract();
  },

  initContract: function () {

    $.getJSON('Voting.json', function (data) {
      var Artifact = data;

      Vote.contracts.Voting = TruffleContract(Artifact);

      Vote.contracts.Voting.setProvider(Vote.web3Provider);
    });
    Vote.doGenerate();
  },

  doGenerate: function () {
    var f1 = document.getElementById('voteform');
    var curve = f1.curve1.value;
    var ec = new KJUR.crypto.ECDSA({ "curve": curve });
    var keypair = ec.generateKeyPairHex();

    f1.pubkey1.value = keypair.ecpubhex;
    var prvkey1 = keypair.ecprvhex + " ";
    var pubkey1 = f1.pubkey1.value;
    var Instance;
    // 获取用户账号
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      Vote.contracts.Voting.deployed().then(function (instance) {
        Instance = instance;
        Instance.doGenerate(prvkey1, { from: account });
        $("#pubkey1").html(pubkey1);
      });
    });
    Vote.handleRegister();
  },

  handleRegister: function () {
    var Instance;

    // 获取用户账号
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      Vote.contracts.Voting.deployed().then(function (instance) {
        Instance = instance;
        Instance.getProjectName.call({ from: account }).then((Vote) => {
          console.log("Success! Got Vote: " + Vote);
          var projectName = Vote;
          $("#projectName").html(projectName);
        }).catch((err) => {
          console.log("Failed with error: " + err);
        });

        for (var i = 0; i < 10; i++) {
          Instance.getCandidateList.call(i, { from: account }).then((Vote) => {
            console.log("Success! Got Vote: " + Vote);
            if (Vote == "")
              return;
            var select = Vote;
            var tbObj = document.getElementsByTagName('tbody');
            var trObj = document.createElement('tr');
            var tdObj = document.createElement('td');
            var inputObj = document.createElement('input');
            var labelObj = document.createElement('label');
            inputObj.setAttribute('type', 'radio');
            inputObj.setAttribute('class', 'form-check-input');
            inputObj.setAttribute('name', 'option1');
            inputObj.setAttribute('onclick', 'votext(this)')
            labelObj.setAttribute('for', '');
            labelObj.setAttribute('class', 'form-check-lable');
            labelObj.innerHTML = select;
            tdObj.appendChild(inputObj);
            tdObj.appendChild(labelObj);
            trObj.appendChild(tdObj);
            tbObj[0].appendChild(trObj);
          }).catch((err) => {
            console.log("Failed with error: " + err);
          });
        }
      });
    });
    Vote.vote();
  },


  vote: function () {
    $(document).on('click', '#votesub', Vote.handleVote);
  },

  handleVote: function () {
    var f1 = document.getElementById('voteform');
    var VotingInstance;
    // 获取用户账号
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      Vote.contracts.Voting.deployed().then(function (instance) {
        VotingInstance = instance;
        VotingInstance.VaildID.call({ from: account }).then((vaildornot) => {
          console.log("Success! Got Vote: " + vaildornot);
          if ($("#r1").prop('checked')) {
            alert('请选择投票');
            return;
          }
          if (!vaildornot) {
            alert("请先注册！");
            window.location.href = "login.html";
          }
          else {
            VotingInstance.isVoted.call({ from: account }).then((votedornot) => {
              console.log("Success! Got Vote: " + votedornot);
              if (votedornot) {
                VotingInstance.getVoteData.call({ from: account }).then((votedata) => {
                  console.log("Success! Got Vote: " + votedata);
                  alert("您已投过票！您投票的对象是：" + votedata);
                  //Vote.initWeb3();
                }).catch((err) => {
                  console.log("Failed with error: " + err);
                });
              }
              else {
                //get privatekey
                VotingInstance.getPrivateKey.call({ from: account }).then((result) => {
                  console.log("Success! Got result: " + result);
                  var prvkey = result;
                  console.log(prvkey);
                  var privateKey = new BigInteger(prvkey, 16);
                  var encryptData = f1.sigval1.value;
                  console.log(encryptData);
                  var privateKey = new BigInteger(prvkey, 16);
                  console.log(privateKey);
                  var cipherMode = f1.cipherMode.value;
                  console.log(cipherMode);
                  var cipher = new SM2Cipher(cipherMode);
                  console.log(cipher);
                  var data = cipher.Decrypt(privateKey, encryptData);
                  console.log(data);

                  var candidateName = data;
                  VotingInstance.voteDataStore(candidateName, { from: account });
                  VotingInstance.voteForCandidate(candidateName, { from: account });
                  VotingInstance.getVoteEndTime.call({ from: account }).then((result) => {
                    console.log("Success! Got result: " + result);
                    alert("投票成功！结果将会于" + result + "公布！")
                  }).catch((err) => {
                    console.log("Failed with error: " + err);
                  });
                });

              }

            }).catch((err) => {
              console.log("Failed with error: " + err);
            });
          }
        }).catch((err) => {
          console.log("Failed with error: " + err);
        });
      });
    });
  }
};

$(function () {
  $(window).load(function () {
    Vote.initWeb3();
  });
});