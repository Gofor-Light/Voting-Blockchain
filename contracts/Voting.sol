pragma solidity ^0.5.16;
contract Voting {


  mapping (bytes32 => uint8) public votesReceived;//储存投票选项和投票数据

  mapping (address=>bool) public voters;//投票状态
  mapping (address=>bool) public register;//注册状态
  mapping (address=>string) public voteData;//投票者对某选项的投票内容

  string[] public candidateList;
  bytes32[] public registerIdList;

  string ProjectName;
  string RegisterStartTime = "2024-03-23 10:00";
  string RegisterEndTime = "2024-03-23 10:00";
  string VoteStartTime ="2024-03-23 10:00";
  string VoteEndTime = "2024-03-23 10:00";
  string PrivateKey;

  uint8 registerCount = 0;
  uint8 voteCount = 0;

  constructor() public {
    //candidateList.push("zhang");
    //candidateList.push("bin");
    //candidateList.push("cheng");
    //registerIdList.push(123456);
    //registerIdList.push(111111);
    //registerIdList.push(222222);
  }

function projectSetup(string memory title, string memory select1, string memory select2, string memory select3,string memory select4, string memory select5, string memory select6,string memory select7, string memory select8, string memory select9,string memory select10) public{
      ProjectName = title;
      candidateList = [select1, select2, select3,select4, select5, select6,select7, select8, select9, select10];
  }

  //注册码
  function registerIdSetup(bytes32 register1, bytes32 register2, bytes32 register3, bytes32 register4, bytes32 register5, bytes32 register6, bytes32 register7, bytes32 register8) public{
      registerIdList.push(register1);
      registerIdList.push(register2);
      registerIdList.push(register3);
      registerIdList.push(register4);
      registerIdList.push(register5);
      registerIdList.push(register6);
      registerIdList.push(register7);
      registerIdList.push(register8);
  }

  function TimeSetSetup(string memory register_start_time,string memory register_end_time, string memory vote_start_time, string memory vote_end_time) public{
    RegisterStartTime = register_start_time;
    RegisterEndTime = register_end_time;
    VoteStartTime = vote_start_time;
    VoteEndTime = vote_end_time;
  }

  function getProjectName() public view returns (string memory){
    return ProjectName;
  }

  function getRegisterStartTime() public view returns (string memory){
    return RegisterStartTime;
  }

  function getRegisterEndTime() public view returns (string memory){
    return RegisterEndTime;
  }

  function getVoteStartTime() public view returns (string memory){
    return VoteStartTime;
  }

  function getVoteEndTime() public view returns (string memory){
    return VoteEndTime;
  }

  function getCandidateList(uint index) public view returns (string memory){
    return candidateList[index];
  }

  function getRegisterCount() public view returns (uint8){
      return registerCount;
  }

  function getVoteCount() public view returns (uint8){
      return voteCount;
  }

  function getVoteData() public view returns (string memory){
      return voteData[msg.sender];
  }

  //某人的总投票数据
  function totalVotesFor(bytes32 candidate) view public returns (uint8) {
    //require(validCandidate(candidate));//the candidate is true
    return votesReceived[candidate];
  }

  //给某人投票并记录已经投票
  function voteForCandidate(bytes32 candidate) public {
    votesReceived[candidate] += 1;
  }

  function voteDataStore(string memory candidate) public {
    //require(!register[msg.sender]);
    require(!voters[msg.sender]);
    //require(validCandidate(candidate));//the candidate is true

    //记录用户已经投票
    voters[msg.sender] = true;
    voteData[msg.sender] = candidate;
    voteCount += 1;
  }

  //用户注册投票项目
  function someoneRegister(bytes32 registerId) public{
      for(uint i = 0; i < registerIdList.length; i++){
          if(registerIdList[i] == registerId){
            register[msg.sender] = true;
            registerIdList[i] = "0x0";
            registerCount += 1;
          }
      }
  }

  //是否注册
  function VaildID() public view returns (bool) {
      if(register[msg.sender]) {
          return true;
      }
      return false;
  }

  //是否投票
  function isVoted() public view returns (bool) {
      if(voters[msg.sender]) {
          return true;
      }
      return false;
  }

  //储存私钥
  function doGenerate(string memory privatekey) public{
      PrivateKey = privatekey;
  }

  //获取私钥
  function getPrivateKey() public view returns (string memory){
      return PrivateKey;
  }

}
