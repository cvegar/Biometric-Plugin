// Empty constructor
function EntelBiometricPlugin() {}

/**
 * Scan Crypto (usa ScanActionCryptoActivity)
 *
 * Params:
 * - rightFingerCode: string|number  (se enviará como "hright")
 * - leftFingerCode:  string|number  (se enviará como "hleft")
 * - instructions:    string         (se enviará como "file")
 * - op:              boolean        (opcional, default false)
 *
 * successCallback recibe:
 * {
 *   huellab64,
 *   serialnumber,
 *   fingerprint_brand,
 *   bioversion
 * }
 */
EntelBiometricPlugin.prototype.scanCrypto = function (
  rightFingerCode,
  leftFingerCode,
  instructions,
  op,
  successCallback,
  errorCallback
) {
  var options = {};

  // Normaliza a string tipo ["valor"] porque el Activity lo espera así.
  function toBracketedString(value) {
    if (value === null || value === undefined) return null;

    var v = String(value).trim();

    // Si ya viene como [ ... ], lo dejamos
    if (v.indexOf("[") === 0 && v.lastIndexOf("]") === v.length - 1) {
      return v;
    }

    // Escapar comillas
    v = v.replace(/"/g, '\\"');
    return '["' + v + '"]';
  }

  // op default false (caso OutSystems)
  options.op = (op === true);

  // ScanActionCryptoActivity espera: file, hright, hleft
  options.file = toBracketedString(instructions);

  // Soporta el typo legado "righFingerCode" si lo sigues usando en otro lado.
  options.hright = toBracketedString(rightFingerCode);
  options.hleft  = toBracketedString(leftFingerCode);

  // Validaciones mínimas para evitar que el Activity explote por substring/replace
  if (!instructions || String(instructions).trim() === "") {
    return errorCallback && errorCallback("Missing parameter: instructions");
  }
  if (!options.op && (!rightFingerCode || !leftFingerCode)) {
    return errorCallback && errorCallback("Missing parameters: rightFingerCode and leftFingerCode (required when op=false)");
  }

  cordova.exec(successCallback, errorCallback, "EntelBiometricPlugin", "scanCrypto", [options]);
};

/**
 * Alias compatible con 4Fingers (por si quieres llamarlo como getwsq)
 * Firma igual que tu ejemplo: (righFingerCode, leftFingerCode, liveness, type, success, error)
 *
 * Nota: liveness y type NO los usa ScanActionCryptoActivity actualmente,
 * pero los mando por si luego los necesitas en Android.
 */
EntelBiometricPlugin.prototype.getwsq = function (
  righFingerCode,
  leftFingerCode,
  liveness,
  type,
  successCallback,
  errorCallback
) {
  var options = {};

  function toBracketedString(value) {
    if (value === null || value === undefined) return null;
    var v = String(value).trim();
    if (v.indexOf("[") === 0 && v.lastIndexOf("]") === v.length - 1) return v;
    v = v.replace(/"/g, '\\"');
    return '["' + v + '"]';
  }

  options.op = false;

  // En 4Fingers viene "righFingerCode" (typo). Lo mapeo al hright.
  options.hright = toBracketedString(righFingerCode);
  options.hleft  = toBracketedString(leftFingerCode);

  // instructions no existe en la firma original, así que puedes definir un default
  // o pasarlo en "type" si lo deseas. Aquí dejo un default seguro.
  // Si tú ya tienes un valor real, cámbialo.
  options.file = toBracketedString("default");

  // Paso extra info por si luego lo usas en Android
  options.liveness = liveness;
  options.type = type;

  if (!options.hright || !options.hleft) {
    return errorCallback && errorCallback("Missing finger codes: righFingerCode and leftFingerCode");
  }

  cordova.exec(successCallback, errorCallback, "EntelBiometricPlugin", "scanCrypto", [options]);
};

// Installation constructor that binds EntelBiometricPlugin to window
EntelBiometricPlugin.install = function () {
  if (!window.plugins) {
    window.plugins = {};
  }
  window.plugins.EntelBiometricPlugin = new EntelBiometricPlugin();
  return window.plugins.EntelBiometricPlugin;
};

cordova.addConstructor(EntelBiometricPlugin.install);
