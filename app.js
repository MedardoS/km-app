const VALOR_KM = 270;

// guardar usuario una sola vez
function guardarUsuario() {
  const usuario = document.getElementById("usuario").value;

  if (!usuario) {
    alert("Ingresa tu nombre");
    return;
  }

  localStorage.setItem("usuario", usuario);
  alert("✅ Usuario guardado");
}

// obtener usuario guardado
function obtenerUsuario() {
  return localStorage.getItem("usuario");
}

// cargar usuario al iniciar
window.onload = function () {
  const usuario = obtenerUsuario();
  if (usuario) {
    document.getElementById("usuario").value = usuario;
  }
};

async function agregar() {
  const usuario = obtenerUsuario();

  if (!usuario) {
    alert("Primero guarda tu usuario");
    return;
  }

  const nuevo = {
    usuario,
    origen: document.getElementById("origen").value,
    codigo: document.getElementById("codigo").value,
    fecha: document.getElementById("fecha").value,
    guia: document.getElementById("guia").value,
    kmReales: parseFloat(document.getElementById("kmReales").value),
    kmCargados: parseFloat(document.getElementById("kmCargados").value),
    detalle: document.getElementById("detalle").value,
    fechaRegistro: new Date()
  };

  await db.collection("recorridos").add(nuevo);

  alert("✅ Guardado en la nube");

  // limpiar campos
  document.getElementById("origen").value = "";
  document.getElementById("codigo").value = "";
  document.getElementById("fecha").value = "";
  document.getElementById("guia").value = "";
  document.getElementById("kmReales").value = "";
  document.getElementById("kmCargados").value = "";
  document.getElementById("detalle").value = "";
}

async function generarExcel() {
  const usuario = obtenerUsuario();

  if (!usuario) {
    alert("No hay usuario");
    return;
  }

  const snapshot = await db.collection("recorridos")
    .where("usuario", "==", usuario)
    .get();

  let excelData = [
    ["LOCAL ORIGEN", "CÓDIGO FOX", "FECHA", "GUÍA",
     "KM REALES", "KM CARGADOS", "DIFERENCIA", "VALOR", "DETALLE"]
  ];

  snapshot.forEach(doc => {
    const d = doc.data();

    const diferencia = d.kmReales - d.kmCargados;
    const valor = diferencia * VALOR_KM;

    excelData.push([
      d.origen,
      d.codigo,
      d.fecha,
      d.guia,
      d.kmReales,
      d.kmCargados,
      diferencia,
      valor,
      d.detalle
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");

  // nombre del archivo con usuario
  XLSX.writeFile(wb, `reporte_km_${usuario}.xlsx`);
}