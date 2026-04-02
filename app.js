const VALOR_KM = 270;

// =======================
// USUARIO
// =======================

function guardarUsuario() {
  let usuario = document.getElementById("usuario").value;

  if (!usuario) {
    alert("Ingresa tu nombre");
    return;
  }

  // normalizar
  usuario = usuario.trim().toLowerCase();

  localStorage.setItem("usuario", usuario);
  document.getElementById("usuario").value = usuario;

  alert("✅ Usuario guardado");
}

function obtenerUsuario() {
  return localStorage.getItem("usuario");
}

window.onload = function () {
  const usuario = obtenerUsuario();
  if (usuario) {
    document.getElementById("usuario").value = usuario;
  }
};

// =======================
// GUARDAR DATOS
// =======================

async function agregar() {
  const usuario = obtenerUsuario();

  if (!usuario) {
    alert("Primero guarda tu usuario");
    return;
  }

  const origen = document.getElementById("origen").value;
  const codigo = document.getElementById("codigo").value;
  const fecha = document.getElementById("fecha").value;
  const guia = document.getElementById("guia").value;
  const kmReales = parseFloat(document.getElementById("kmReales").value);
  const kmCargados = parseFloat(document.getElementById("kmCargados").value);
  const detalle = document.getElementById("detalle").value;

  if (!origen || !codigo || !fecha) {
    alert("Completa los campos obligatorios");
    return;
  }

  try {
    await db.collection("recorridos").add({
      usuario: usuario.trim().toLowerCase(),
      origen,
      codigo,
      fecha,
      guia,
      kmReales: kmReales || 0,
      kmCargados: kmCargados || 0,
      detalle,
      fechaRegistro: new Date()
    });

    alert("✅ Guardado en la nube");

    // limpiar campos
    document.getElementById("origen").value = "";
    document.getElementById("codigo").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("guia").value = "";
    document.getElementById("kmReales").value = "";
    document.getElementById("kmCargados").value = "";
    document.getElementById("detalle").value = "";

  } catch (error) {
    console.error(error);
    alert("❌ Error al guardar");
  }
}

// =======================
// GENERAR EXCEL
// =======================

async function generarExcel() {
  const usuario = obtenerUsuario()?.trim().toLowerCase();

  if (!usuario) {
    alert("❌ No hay usuario guardado");
    return;
  }

  try {
    const snapshot = await db.collection("recorridos")
      .where("usuario", "==", usuario)
      .get();

    if (snapshot.empty) {
      alert("⚠️ No hay registros para este usuario");
      return;
    }

    let excelData = [
      ["LOCAL ORIGEN", "CÓDIGO FOX", "FECHA", "GUÍA",
       "KM REALES", "KM CARGADOS", "DIFERENCIA", "VALOR", "DETALLE"]
    ];

    snapshot.forEach(doc => {
      const d = doc.data();

      const kmReales = Number(d.kmReales) || 0;
      const kmCargados = Number(d.kmCargados) || 0;

      const diferencia = kmReales - kmCargados;
      const valor = diferencia * VALOR_KM;

      excelData.push([
        d.origen || "",
        d.codigo || "",
        d.fecha || "",
        d.guia || "",
        kmReales,
        kmCargados,
        diferencia,
        valor,
        d.detalle || ""
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    const nombreArchivo = `reporte_km_${usuario}.xlsx`;

    XLSX.writeFile(wb, nombreArchivo);

    alert("📄 Excel generado correctamente");

  } catch (error) {
    console.error(error);
    alert("❌ Error al generar Excel");
  }
}