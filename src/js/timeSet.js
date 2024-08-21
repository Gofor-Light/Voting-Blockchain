TimeSet = {
    web3Provider: null,
    contracts: {},

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            TimeSet.web3Provider = web3.currentProvider;
        } else {
            TimeSet.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(TimeSet.web3Provider);
        TimeSet.initContract();
    },

    initContract: function () {

        $.getJSON('Voting.json', function (data) {
            var Artifact = data;

            TimeSet.contracts.Voting = TruffleContract(Artifact);

            TimeSet.contracts.Voting.setProvider(TimeSet.web3Provider);
            //console.log(TimeSet.contracts.Voting);
            //TimeSet.setCounts();
        });
         TimeSet.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-block', TimeSet.handleTimeSet);
    },

    handleTimeSet: function() {
      var VotingInstance;
      var register_start_time = $("#register_start_time").val();
      var register_end_time = $("#register_end_time").val();
      var vote_start_time = $("#vote_start_time").val();
      var vote_end_time = $("#vote_end_time").val();

      //console.log(TimeSet);
      // 获取用户账号
      web3.eth.getAccounts(function (error, accounts) {
          if (error) {
              console.log(error);
          }

          var account = accounts[0];
          if(account == 0x4218296a5f43B918BdBD4fE118B8791e5F76154c)
          {
            TimeSet.contracts.Voting.deployed().then(function (instance) {
                VotingInstance = instance;
                VotingInstance.TimeSetSetup(register_start_time, register_end_time, vote_start_time, vote_end_time, {from: account});
                window.location.href="note.html";
              });
          }
          else{
            alert("账号错误");
            window.location.href="index.html";
          }
      });
    }
}


$(function () {
    $(window).load(function () {
        TimeSet.initWeb3();
    });
});
