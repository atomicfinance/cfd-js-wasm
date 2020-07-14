const updateField = async function(event) {
  const inputTx = document.getElementById("inputTx");
  const decoded = document.getElementById("decoded");
  const networkObj = document.getElementById("network");
  const txid = document.getElementById("txid");
  const vout = document.getElementById("vout");
  const addr = document.getElementById("address");
  const selectedNetworkIdx = networkObj.selectedIndex;
  let networkValue = networkObj.options[selectedNetworkIdx].value;
  let network = networkValue;
  let address = '';
  let descriptor = '';
  let amount = 0;
  let commitment = '';

  let isElements = true;
  if ((network === 'mainnet') || (network === 'testnet') || (network === 'regtest')) {
    isElements = false;
  } else if (network === 'elementsregtest') {
    network = 'regtest';
  }
  try {
    const req = {
      descriptor: addr.value,
      isElements,
      network,
    };
    await callJsonApi(Module, 'ParseDescriptor', req);
    descriptor = addr.value;
  } catch (e) {
    address = addr.value;
  }

  const value = document.getElementById("amount");
  if (value.value.length == 66) {
    commitment = value.value;
  } else {
    amount = parseInt(value.value);
  }

  try {
    const req = {
      tx: inputTx.value,
      isElements,
      txins: [{
        txid: txid.value,
        vout: parseInt(vout.value),
        address: address,
        amount: amount,
        descriptor: descriptor,
        confidentialValueCommitment: commitment,
      }],
    };
    const resp = await callJsonApi(Module, 'VerifySign', req);
    decoded.value = JSON.stringify(resp, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, '  ');
  } catch (e) {
    decoded.value = 'Invalid transaction format';
  }
}

Module['onRuntimeInitialized'] = async function(){
  if (Module['_cfdjsJsonApi']) {
    const decodeBtn = document.getElementById("execDecode");
    decodeBtn.addEventListener('click', updateField);
    console.log("exist cfdjsJsonApi.");
  } else {
    console.log("cfdjsJsonApi not found!");
    const decoded = document.getElementById("decoded");
    decoded.value = "WebAssembly load fail.";
  }
}
