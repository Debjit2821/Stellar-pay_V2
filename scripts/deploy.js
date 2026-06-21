const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function execWithRetry(cmd, options, maxRetries = 4, delayMs = 6000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      console.log(`Executing: ${cmd}`);
      return execSync(cmd, options);
    } catch (error) {
      attempt++;
      console.warn(`⚠️ Command failed (Attempt ${attempt}/${maxRetries}): ${error.message || error}`);
      if (attempt >= maxRetries) {
        throw error;
      }
      console.log(`Waiting ${delayMs / 1000}s before retrying...`);
      execSync(`node -e "setTimeout(() => {}, ${delayMs})"`); // Synchronous wait
    }
  }
}

function run() {
  console.log("🚀 Starting deployment of Stellar Payroll contracts to Testnet...");

  const projectRoot = path.resolve(__dirname, "..");
  
  const treasuryWasm = path.join(
    projectRoot,
    "target",
    "wasm32v1-none",
    "release",
    "payroll_treasury.wasm"
  );
  
  const managerWasm = path.join(
    projectRoot,
    "target",
    "wasm32v1-none",
    "release",
    "payroll_manager.wasm"
  );

  // 1. Build validation
  if (!fs.existsSync(treasuryWasm) || !fs.existsSync(managerWasm)) {
    console.log("🛠️ WASM binaries not found. Building contracts first...");
    try {
      execSync("stellar contract build", { cwd: projectRoot, stdio: "inherit" });
    } catch (e) {
      console.error("❌ Failed to build contracts:", e);
      process.exit(1);
    }
  }

  // Define PATH overrides
  const customPath = [
    "C:\\Users\\debji\\.cargo\\bin",
    "C:\\Program Files (x86)\\Stellar CLI",
    process.env.PATH
  ].join(";");

  const execOptions = {
    cwd: projectRoot,
    env: { ...process.env, PATH: customPath },
    encoding: "utf8"
  };

  // 2. Set up deployer identity
  console.log("🔑 Generating deployer keypair on Stellar Testnet...");
  try {
    let exists = false;
    try {
      const keysList = execSync("stellar keys ls", execOptions);
      if (keysList.includes("deployer")) {
        exists = true;
      }
    } catch (e) {}

    if (exists) {
      console.log("ℹ️ Identity 'deployer' already exists. Reusing it.");
    } else {
      console.log("Creating new identity 'deployer'...");
      execSync("stellar keys generate deployer --network testnet", execOptions);
      console.log("✅ Deployer identity created.");
    }

    console.log("Funding deployer identity via Friendbot...");
    execWithRetry("stellar keys fund deployer --network testnet", execOptions);
    console.log("✅ Deployer identity funded.");
  } catch (error) {
    console.error("❌ Failed to setup keypair:", error);
    process.exit(1);
  }

  // Stagger deployments to avoid rate limiting
  console.log("Waiting 5s before starting deployment...");
  execSync(`node -e "setTimeout(() => {}, 5000)"`);

  // 3. Deploy Treasury WASM contract
  console.log("📦 Deploying Payroll Treasury contract...");
  let treasuryContractId = "";
  try {
    const deployCmd = `stellar contract deploy --wasm "${treasuryWasm}" --source deployer --network testnet`;
    const output = execWithRetry(deployCmd, execOptions);
    const match = output.trim().match(/C[A-Z0-9]{55}/);
    if (match) {
      treasuryContractId = match[0];
    } else {
      console.error("❌ Failed to parse treasury contract ID.");
      process.exit(1);
    }
    console.log(`🎉 Treasury Deployed: ${treasuryContractId}`);
  } catch (error) {
    console.error("❌ Treasury deployment failed:", error);
    process.exit(1);
  }

  // Stagger deployments to avoid rate limiting
  console.log("Waiting 8s before deploying second contract...");
  execSync(`node -e "setTimeout(() => {}, 8000)"`);

  // 4. Deploy Manager WASM contract
  console.log("📦 Deploying Payroll Manager contract...");
  let managerContractId = "";
  try {
    const deployCmd = `stellar contract deploy --wasm "${managerWasm}" --source deployer --network testnet`;
    const output = execWithRetry(deployCmd, execOptions);
    const match = output.trim().match(/C[A-Z0-9]{55}/);
    if (match) {
      managerContractId = match[0];
    } else {
      console.error("❌ Failed to parse manager contract ID.");
      process.exit(1);
    }
    console.log(`🎉 Manager Deployed: ${managerContractId}`);
  } catch (error) {
    console.error("❌ Manager deployment failed:", error);
    process.exit(1);
  }

  // Stagger calls
  console.log("Waiting 6s before fetching account details...");
  execSync(`node -e "setTimeout(() => {}, 6000)"`);

  // 5. Get Deployer Account Address
  console.log("🔍 Fetching deployer public key...");
  let deployerAddress = "";
  try {
    const output = execSync("stellar keys address deployer", execOptions);
    deployerAddress = output.trim();
    console.log(`🔑 Deployer Admin Address: ${deployerAddress}`);
  } catch (error) {
    console.error("❌ Failed to get deployer address:", error);
    process.exit(1);
  }

  // Default SAC token (Stellar Testnet XLM SAC Contract)
  const xlmSacContract = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

  // Stagger calls
  console.log("Waiting 6s before initializing Treasury...");
  execSync(`node -e "setTimeout(() => {}, 6000)"`);

  // 6. Initialize Treasury Contract
  console.log("⚙️ Initializing Treasury Contract...");
  try {
    const initCmd = `stellar contract invoke --id "${treasuryContractId}" --source deployer --network testnet -- initialize --admin "${deployerAddress}" --manager "${managerContractId}"`;
    execWithRetry(initCmd, execOptions);
    console.log("✅ Treasury initialized successfully.");
  } catch (error) {
    console.error("❌ Treasury initialization failed:", error);
    process.exit(1);
  }

  // Stagger calls
  console.log("Waiting 6s before initializing Manager...");
  execSync(`node -e "setTimeout(() => {}, 6000)"`);

  // 7. Initialize Manager Contract
  console.log("⚙️ Initializing Manager Contract...");
  try {
    const initCmd = `stellar contract invoke --id "${managerContractId}" --source deployer --network testnet -- initialize --admin "${deployerAddress}" --treasury "${treasuryContractId}" --token "${xlmSacContract}"`;
    execWithRetry(initCmd, execOptions);
    console.log("✅ Manager initialized successfully.");
  } catch (error) {
    console.error("❌ Manager initialization failed:", error);
    process.exit(1);
  }

  // 8. Write environment configurations
  const envPath = path.join(projectRoot, ".env.local");
  const envContent = `NEXT_PUBLIC_MANAGER_CONTRACT_ID=${managerContractId}
NEXT_PUBLIC_TREASURY_CONTRACT_ID=${treasuryContractId}
NEXT_PUBLIC_TOKEN_CONTRACT_ID=${xlmSacContract}
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
`;
  fs.writeFileSync(envPath, envContent, "utf8");
  console.log(`📝 Wrote Env config to ${envPath}`);

  // Write JSON config file
  const libDir = path.join(projectRoot, "lib");
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  const configPath = path.join(libDir, "config.json");
  const configContent = JSON.stringify({
    managerContractId,
    treasuryContractId,
    tokenContractId: xlmSacContract,
    network: "testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test Stellar Network ; September 2015"
  }, null, 2);
  fs.writeFileSync(configPath, configContent, "utf8");
  console.log(`📝 Wrote JSON config to ${configPath}`);

  console.log("\n🚀 All Stellar contracts deployed and initialized successfully!");
  console.log(`Manager ID: ${managerContractId}`);
  console.log(`Treasury ID: ${treasuryContractId}`);
}

run();
