import React, { useState, useEffect } from "react";

function App() {
  const [fileBase64, setFileBase64] = useState(null); // Almacena el archivo en Base64
  const [algorithm, setAlgorithm] = useState("SHA256withRSA"); // Algoritmo por defecto
  const [format, setFormat] = useState("PAdES"); // Formato de firma por defecto
  const [params, setParams] = useState(""); // Parámetros adicionales si es necesario

  // Cargar AutoFirma al montar el componente
  useEffect(() => {
    if (window.AutoScript) {
      window.AutoScript.cargarAppAfirma(); // Abre la aplicación AutoFirma
    } else {
      console.error("AutoScript no se ha cargado correctamente.");
    }
  }, []);

  // Función para seleccionar certificado
  const selectCertificate = () => {
    try {
      window.AutoScript.selectCertificate(
        "",
        (certificate) => {
          console.log("Certificado seleccionado:", certificate);
        },
        (type, message) => {
          console.error(
            "Error al seleccionar el certificado. Tipo:",
            type,
            "Mensaje:",
            message
          );
        }
      );
    } catch (e) {
      console.error(
        "Error al invocar AutoScript. Tipo:",
        window.AutoScript.getErrorType(),
        "Mensaje:",
        window.AutoScript.getErrorMessage()
      );
    }
  };

  // Función para manejar la carga del archivo y convertirlo a Base64
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Convertir el archivo a Base64
        const base64Data = reader.result.split(",")[1];
        setFileBase64(base64Data);
        console.log("Archivo cargado y convertido a Base64:", base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const signDocument = () => {
    if (!fileBase64) {
      alert("Primero sube un documento para firmar.");
      return;
    }

    try {
      window.AutoScript.sign(
        fileBase64,
        algorithm, // Algoritmo de firma
        format, // Formato de firma
        "", // Parámetros adicionales si los hay
        (signedData) => {
          console.log("Firma completada:", signedData);
          // Si `signedData` es Base64, lo podemos convertir a un Blob para descargarlo
          const byteCharacters = atob(signedData); // Decodificar Base64 a binario
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
          }
          const blob = new Blob(byteArrays, {
            type: "application/octet-stream",
          });

          // Crear un enlace de descarga y simular el clic para descargar el archivo
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = "documento_firmado.pdf"; // Nombre predeterminado para el archivo
          downloadLink.click();

          alert("Firma completada y archivo guardado.");
        },
        (type, message) => {
          console.error("Error al firmar. Tipo:", type, "Mensaje:", message);
          alert(`Error al firmar: ${message}`);
        }
      );
    } catch (e) {
      console.error("Error al invocar AutoScript para firmar:", e);
    }
  };

  // Función para hacer la firma y guardar el archivo firmado
  const doSignAndSave = (cryptoOp) => {
    try {
      let data;
      if (cryptoOp === "sign") {
        data = fileBase64; // Usamos el archivo cargado como dato
      } else {
        alert("Operación no soportada en este momento.");
        return;
      }

      // Llamamos a AutoScript para firmar y guardar el archivo
      window.AutoScript.signAndSaveToFile(
        cryptoOp,
        data,
        algorithm,
        format,
        params,
        null, // No utilizamos ningún callback adicional
        (signedData) => {
          console.log("Firma completada:", signedData);

          // Aquí, `signedData` debería ser el archivo firmado en formato Base64 o algún otro formato binario.
          // Si `signedData` es Base64, lo podemos convertir a un Blob para descargarlo.

          const byteCharacters = atob(signedData); // Decodificar Base64 a binario
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
          }
          const blob = new Blob(byteArrays, {
            type: "application/octet-stream",
          });

          // Crear un enlace de descarga y simular el clic para descargar el archivo
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = "documento_firmado.pdf"; // Nombre predeterminado para el archivo
          downloadLink.click();

          alert("Firma completada y archivo guardado.");
        },
        (type, message) => {
          console.error("Error al firmar. Tipo:", type, "Mensaje:", message);
          alert(`Error al firmar: ${message}`);
        }
      );
    } catch (e) {
      try {
        console.error(
          "Error al invocar AutoScript. Tipo:",
          window.AutoScript.getErrorType(),
          "Mensaje:",
          window.AutoScript.getErrorMessage()
        );
      } catch (ex) {
        console.error("Error desconocido:", e);
      }
    }
  };

  // Función para firmar el documento cargado
  //   const signDocument = () => {
  //     if (!fileBase64) {
  //       alert("Primero sube un documento para firmar.");
  //       return;
  //     }
  //     doSignAndSave('sign');
  //   };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AutoFirma</h1>
      <div style={{ marginTop: "20px" }}>
        <h3>Paso 1: Cargar Documento</h3>
        <input type="file" onChange={handleFileUpload} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Paso 2: Firmar Documento</h3>
        <button onClick={signDocument}>Firmar Documento</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {/* <h3>Configuración de Firma</h3> */}
        {/* <div>
          <label>Algoritmo: </label>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
            <option value="SHA256withRSA">SHA256withRSA</option>
            <option value="SHA512withRSA">SHA512withRSA</option>
          </select>
        </div> */}
        {/* <div style={{ marginTop: "10px" }}>
          <label>Formato: </label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="PAdES">PAdES</option>
            <option value="XAdES">XAdES</option>         
          </select>
        </div> */}
        {/* <div style={{ marginTop: "10px" }}>
          <label>Parámetros: </label>
          <input
            type="text"
            value={params}
            onChange={(e) => setParams(e.target.value)}
          />
        </div> */}
      </div>
    </div>
  );
}

export default App;
