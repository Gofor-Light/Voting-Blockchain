Project = {
    web3Provider: null,
    contracts: {},

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            Project.web3Provider = web3.currentProvider;
        } else {
            Project.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(Project.web3Provider);
        Project.initContract();
    },

    initContract: function () {

        $.getJSON('Voting.json', function (data) {
            var Artifact = data;

            Project.contracts.Voting = TruffleContract(Artifact);

            Project.contracts.Voting.setProvider(Project.web3Provider);
        });
        Project.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-block', Project.handleProject);
    },

    handleProject: function () {
        var VotingInstance;
        var project_name = $("#project_name").val();
        var num = document.getElementsByTagName("input").length;
        var sinput = document.getElementsByTagName("input");
        var select_name = [];
        for (var i = 1; i <= num - 1; i++) {
            if (sinput[i].value != ""){
                if(checkLabel(sinput[i],/^\S*$/))
                    select_name.push(sinput[i].value);
                else{
                    alert("请正确输入内容");
                    return;
                }
            }else select_name.push("");
        }
        for (var i = num;i <= 10;i++)
            select_name.push("");
        console.log(select_name);

        //获取用户账号
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];
            if (account == 0x4218296a5f43B918BdBD4fE118B8791e5F76154c) {
                Project.contracts.Voting.deployed().then(function (instance) {
                    VotingInstance = instance;
                    VotingInstance.projectSetup(project_name, select_name[0], select_name[1], select_name[2], select_name[3], select_name[4], select_name[5], select_name[6], select_name[7], select_name[8], select_name[9], { from: account });
                    window.location.href = "registerId.html";
                });
            }
            else {
                alert("账号错误，请用管理员账户登录Metamask");
                window.location.href = "index.html";
            }
        });
    },

}

$(function () {
    $(window).load(function () {
        Project.initWeb3();
    });
});

function checkLabel(obj, rex, sname) {
    var length = obj.value.length;
    var label = obj.parentElement.getElementsByClassName("error")[0];
    if (length > 0) {
      if (rex.test(obj.value)) {
        label.textContent = "✔";
        if(sname != null)
            document.getElementById(sname).style.color = "green";
        return true;
      }
      label.textContent = "不得输入空格";
      if(sname != null)
        document.getElementById(sname).style.color = "red";
      return false;
    } else label.textContent = "";
    return true;
  }