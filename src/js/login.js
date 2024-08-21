Login = {
    web3Provider: null,
    contracts: {},

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            Login.web3Provider = web3.currentProvider;
        } else {
            Login.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(Login.web3Provider);
        Login.initContract();
    },

    initContract: function () {

        $.getJSON('Voting.json', function (data) {
            var Artifact = data;

            Login.contracts.Voting = TruffleContract(Artifact);

            Login.contracts.Voting.setProvider(Login.web3Provider);
        });
         Login.doGenerate();
    },

    doGenerate: function(){
      var f1 = document.loginform;
      var curve = f1.curve1.value;
      var ec = new KJUR.crypto.ECDSA({"curve": curve});
      var keypair = ec.generateKeyPairHex();

      f1.pubkey1.value = keypair.ecpubhex;
      var prvkey1 = keypair.ecprvhex+" ";
      var pubkey1 = f1.pubkey1.value;
      var Instance;
      // 获取用户账号
      web3.eth.getAccounts(function (error, accounts) {
          if (error) {
              console.log(error);
          }

          var account = accounts[0];

          Login.contracts.Voting.deployed().then(function (instance) {
                Instance = instance;
                Instance.doGenerate(prvkey1, {from: account});
                $("#pubkey1").html(pubkey1);
              });
      });
      Login.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn', Login.handleRegister);
    },

    handleRegister: function() {
      var inObj = document.getElementById('regid');
      if(!checkLabel(inObj,/^\S*$/)){
        alert('请正确输入注册码')
        return;
      }
      var f1 = document.loginform;
      var VotingInstance;
      // 获取用户账号
      web3.eth.getAccounts(function (error, accounts) {
          if (error) {
              console.log(error);
          }

          var account = accounts[0];

          Login.contracts.Voting.deployed().then(function (instance) {
              VotingInstance = instance;

              //get privatekey
              VotingInstance.getPrivateKey.call({from:account}).then((result) => {
                console.log("Success! Got result: " + result);
                var prvkey = result;
                var privateKey = new BigInteger(prvkey, 16);
                var encryptData = f1.sigval1.value;
                var privateKey = new BigInteger(prvkey, 16);
          	    var cipherMode = f1.cipherMode.value;
                var cipher = new SM2Cipher(cipherMode);
                var data = cipher.Decrypt(privateKey, encryptData);
                // console.log(prvkey);
                // console.log(encryptData);
                // console.log(privateKey);
                // console.log(cipherMode);
                // console.log(cipher);
                // console.log(data);

                if(data == "0x0"){
                  alert("注册码错误");
                  Login.bindEvents();
                }

                var registerId = data;

                VotingInstance.VaildID.call({from:account}).then((result) => {
                console.log("Success! Got result: " + result);
                if(result){
                  alert("用户已注册成功");
                  window.location.href = "vote.html";
                }
                else{
                  VotingInstance.someoneRegister(registerId, {from: account});
                  VotingInstance.VaildID.call({from:account}).then((result) => {
                    console.log("Success! Got result: " + result);
                    if(result){
                      alert("注册成功！");
                      window.location.href = "vote.html";
                    }
                    else {
                      Login.bindEvents();
                    }
                  }).catch((err) => {
                    console.log("Failed with error: " + err);
                  });
                }
      });
    });
    });
  });
}
};

$(function () {
    $(window).load(function () {
        Login.initWeb3();
    });
});

function checkLabel(obj, rex) {
  var length = obj.value.length
  var label = obj.parentElement.getElementsByClassName("error")[0]
  if (length > 0) {
    if (rex.test(obj.value)) {
      label.textContent = "✔"
      document.getElementById("voteSpan").style.color = "green"
      return true
    }
    label.textContent = "不得输入空格"
    document.getElementById("voteSpan").style.color = "red"
    return false
  }
  label.textContent = "长度必须大于0"
  document.getElementById("voteSpan").style.color = "red"
  return false
}