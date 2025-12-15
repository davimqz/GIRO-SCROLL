// Endereços dos contratos (preencher após deploy em Sepolia)
export const CONTRACT_ADDRESSES = {
  giroToken: "0x23f1623554357651e3C5777f8D9ab868F2167108", // GiroToken address
  giroMarketplace: "0xCEd6d78e729eda04F71e1e7614f2Bab2B797B2C2" // GiroMarketplace address
};

// ABIs dos contratos
export const GIRO_TOKEN_ABI = [
  "function balanceOf(address owner) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function claimOnboarding() public returns (bool)",
  "function hasClaimedOnboarding(address user) public view returns (bool)"
];

export const GIRO_MARKETPLACE_ABI = [
  "function nextPostId() public view returns (uint256)",
  "function createPost(string memory _title, string memory _description, string memory _category, string memory _imageIpfs, uint256 _price) public returns (uint256)",
  "function buyPost(uint256 _postId) public returns (bool)",
  "function getPost(uint256 _postId) public view returns (tuple(uint256 id, address creator, string title, string description, string category, string imageIpfs, uint256 price, uint256 createdAt, bool sold))",
  "function getUserPosts(address _user) public view returns (uint256[])",
  "function getUserPurchases(address _user) public view returns (uint256[])",
  "event PostCreated(uint256 indexed postId, address indexed creator, string title, string description, string category, string imageIpfs, uint256 price)",
  "event PostPurchased(uint256 indexed postId, address indexed buyer, address indexed creator, uint256 price)"
];

export const SEPOLIA_CHAIN_ID = 11155111;
