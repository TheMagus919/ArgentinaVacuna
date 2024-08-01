function permitirEdicion() {
  const form = document.getElementById('perfil');
  const boton = document.getElementById('editarPerfil');
  const botonGuardar = document.getElementById('guardarPerfil');
  const valor = boton.getAttribute("value");
  const inputs = form.querySelectorAll('input');
  const selects = form.querySelectorAll('select');

  if (valor == "Cancelar") {
    inputs.forEach(input => {
      input.readOnly = true;
      input.required = false;
    });

    selects.forEach(select => {
      select.disabled = true;
      select.required = false;
    });
    boton.setAttribute("readOnly", false);
    botonGuardar.setAttribute("readOnly", false);
    boton.setAttribute("value", "Editar");
    botonGuardar.setAttribute("hidden", true);
  } else if (valor == "Editar") {
    inputs.forEach(input => {
      input.readOnly = false;
      input.required = true;
    });

    selects.forEach(select => {
      select.disabled = false;
      select.required = true;
    });

    document.getElementById('mail').setAttribute("readOnly", true);
    document.getElementById('mail').setAttribute("required", false);
    document.getElementById('dniAgente').setAttribute("readOnly", true);
    document.getElementById('dniAgente').setAttribute("required", false);
    document.getElementById('matricula').setAttribute("readOnly", true);
    document.getElementById('matricula').setAttribute("required", false);
    document.getElementById('provincia').setAttribute("readOnly", true);
    document.getElementById('provincia').setAttribute("required", false);
    document.getElementById('rol').setAttribute("readOnly", true);
    document.getElementById('rol').setAttribute("required", false);
    boton.setAttribute("required", false);
    botonGuardar.setAttribute("required", false);
    boton.setAttribute("value", "Cancelar");
    botonGuardar.removeAttribute("hidden");
  }
}

function eliminarRegistroAplicacion(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este registro de Aplicacion?');

  if (confirmacion) {
    fetch(`/aplicacion/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarRegistroDepProv(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este registro de Distribucion?');

  if (confirmacion) {
    fetch(`/distribucion/distribucionDepoPro/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarCentroVac(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este Centro de Vacunacion?');

  if (confirmacion) {
    fetch(`/centroDeVacunacion/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else if(response.status == 400){
          alert('No se puede Eliminar este Centro de Vacunacion.');
        }else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarDepProv(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este Deposito Provincial?');

  if (confirmacion) {
    fetch(`/depositoProvincial/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else if(response.status == 400){
          alert('No se puede Eliminar este Deposito Provincial.');
        }else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarLab(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este Laboratorio?');

  if (confirmacion) {
    fetch(`/laboratorio/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else if(response.status == 400){
          alert('No se puede Eliminar este Laboratorio.');
        }else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarLoteProveedor(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este Lote Proveedor?');

  if (confirmacion) {
    fetch(`/loteProveedor/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else if(response.status == 400){
          alert('No se puede Eliminar este Lote Proveedor.');
        }else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarPaciente(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este Paciente?');

  if (confirmacion) {
    fetch(`/paciente/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else if(response.status == 400){
          alert('No se puede Eliminar este Paciente.');
        }else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarTipoVac(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este Tipo de Vacuna?');

  if (confirmacion) {
    fetch(`/tipoVacuna/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else if(response.status == 400){
          alert('No se puede Eliminar este Tipo de Vacuna.');
        }else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarRegistroDepNac(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este registro de Distribucion?');

  if (confirmacion) {
    fetch(`/distribucion/distribucionDepoNac/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else if(response.status == 400){
          alert('No se puede Eliminar este Registro de Distribucion.');
        }else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarRegistroCentroVac(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este registro de Distribucion?');

  if (confirmacion) {
    fetch(`/distribucion/distribucionCentroVac/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function eliminarRegistroTraslado(id, button) {
  const confirmacion = confirm('¿Estás seguro de que quieres borrar este registro de Traslado?');

  if (confirmacion) {
    fetch(`/traslado/eliminar/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const row = button.closest('tr');
          row.remove();
        } else {
          console.error('Error al borrar el registro.');
        }
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
      });
  }
}

function llenarLoteProv() {
  const campoDep = document.getElementById('idDepProv');
  const campolote = document.getElementById('nroLote');
  const textoD = campoDep.value;
  const partesD = textoD.split('-');
  const id = partesD[0].trim();

  document.getElementById('lotes').removeAttribute("hidden");
  fetch(`http://localhost:2000/descarte/provincia/lotes?id=${id}`)
    .then(response => response.json())
    .then(data => {
      campolote.innerHTML = '';
      if (data && data.lotes) {
        if (data.lotes.length == 0) {
          const noOption = document.createElement('option');
          noOption.text = 'No se encontraron lotes';
          campolote.add(noOption);
        }
        data.lotes.forEach(function (lote) {
          const newOption = document.createElement('option');
          newOption.value = lote.nroLote;
          newOption.text = lote.nroLote + " - " + lote.LoteProveedor.nombreComercial;
          campolote.add(newOption);
        });
      } else {
        const noOption = document.createElement('option');
        noOption.text = 'No se encontraron lotes';
        campolote.add(noOption);
      }
    })
    .catch(error => {
      campolote.innerHTML = '';
      const errorOption = document.createElement('option');
      errorOption.text = 'Error al cargar informacion';
      campolote.add(errorOption);
    });

}

function llenarLoteCentro() {
  const campoCentro = document.getElementById('idCentro');
  const campolote = document.getElementById('nroLote');
  const textoC = campoCentro.value;
  const partesC = textoC.split('-');
  const id = partesC[0].trim();

  document.getElementById('lotes').removeAttribute("hidden");
  fetch(`http://localhost:2000/descarte/centroDeVacunacion/lotes?id=${id}`)
    .then(response => response.json())
    .then(data => {
      campolote.innerHTML = '';
      if (data && data.lotes) {
        if (data.lotes.length == 0) {
          const noOption = document.createElement('option');
          noOption.text = 'No se encontraron lotes';
          campolote.add(noOption);
        }
        data.lotes.forEach(function (lote) {
          const newOption = document.createElement('option');
          newOption.value = lote.nroLote;
          newOption.text = lote.nroLote + " - " + lote.LoteProveedor.nombreComercial;
          campolote.add(newOption);
        });
      } else {
        const noOption = document.createElement('option');
        noOption.text = 'No se encontraron lotes';
        campolote.add(noOption);
      }
    })
    .catch(error => {
      campolote.innerHTML = '';
      const errorOption = document.createElement('option');
      errorOption.text = 'Error al cargar informacion';
      campolote.add(errorOption);
    });

}

document.addEventListener("DOMContentLoaded", function () {
  const campoProvincia = document.getElementById('provinciaRegistro');
  const campoProvincia2 = document.getElementById('provinciaRegistro2');
  const campoPais = document.getElementById('pais');
  const campoRol = document.getElementById('rolRegistro');
  var trabaja = document.getElementById('trabajaRegistro');


  campoRol.addEventListener("change", function () {
    const rol = campoRol.value;

    if (rol == "Deposito Centro Vacunacion" || rol == "Medico" || rol == "Deposito Provincial") {
      document.getElementById('provGroup').removeAttribute("hidden");
      document.getElementById('trabaja').setAttribute("hidden", true);
      campoProvincia.removeAttribute("hidden");
      campoProvincia.removeAttribute("disabled");
      campoProvincia.setAttribute("required", true);

      campoProvincia2.setAttribute("hidden", true);
      campoProvincia2.setAttribute("disabled", true);
      campoProvincia2.removeAttribute("required");
      document.getElementById('pais').value = "";
      document.getElementById('provinciaRegistro2').value = "";

    } else if (rol === "Laboratorio") {
      document.getElementById('provGroup').removeAttribute("hidden");
      document.getElementById('trabaja').setAttribute("hidden", true);
      campoProvincia2.removeAttribute("hidden");
      campoProvincia2.removeAttribute("disabled");
      campoProvincia2.setAttribute("required", true);

      campoProvincia.setAttribute("hidden", true);
      campoProvincia.setAttribute("disabled", true);
      campoProvincia.removeAttribute("required");

      document.getElementById('pais').value = "";

    } else {
      document.getElementById('provGroup').setAttribute("hidden", true);
      document.getElementById('trabaja').setAttribute("hidden", true);
      campoProvincia.setAttribute("hidden", true);
      campoProvincia2.setAttribute("hidden", true);
      campoProvincia.removeAttribute("required");
      campoProvincia.setAttribute("disabled", true);
      campoProvincia2.setAttribute("disabled", true);
      campoProvincia2.removeAttribute("required");

      document.getElementById('pais').value = "";
    }
  });

  campoProvincia.addEventListener("change", function () {
    const provincia = campoProvincia.value;
    const rol = campoRol.value;
    const pais = campoPais.value;
    document.getElementById('trabaja').removeAttribute("hidden");
    trabaja.innerHTML = '';
    fetch(`http://localhost:2000/auth/trabaja?provincia=${provincia}&rol=${rol}&pais=${pais}`)
      .then(response => response.json())
      .then(data => {
        trabaja.innerHTML = '';
        if (data && data.centros) {
          if (data.centros.length == 0) {
            const noOption = document.createElement('option');
            noOption.text = 'No se encontraron centros';
            trabaja.add(noOption);
          }
          data.centros.forEach(function (centro) {
            const newOption = document.createElement('option');
            newOption.value = centro.idCentro;
            newOption.text = centro.nombre;
            trabaja.add(newOption);
          });
        } else if (data && data.depositos) {
          if (data.depositos.length == 0) {
            const noOption = document.createElement('option');
            noOption.text = 'No se encontraron depositos';
            trabaja.add(noOption);
          }
          data.depositos.forEach(function (deposito) {
            const newOption = document.createElement('option');
            newOption.value = deposito.idDepProv;
            newOption.text = deposito.nombre;
            trabaja.add(newOption);
          });
        } else if (data && data.laboratorios) {
          if (data.laboratorios.length == 0) {
            const noOption = document.createElement('option');
            noOption.text = 'No se encontraron laboratorios';
            trabaja.add(noOption);
          }
          data.depositos.forEach(function (laboratorio) {
            const newOption = document.createElement('option');
            newOption.value = laboratorio.idLab;
            newOption.text = laboratorio.nombre;
            trabaja.add(newOption);
          });
        } else {
          const noOption = document.createElement('option');
          noOption.text = 'No se encontraron informacion';
          trabaja.add(noOption);
        }
      })
      .catch(error => {
        trabaja.innerHTML = '';
        const errorOption = document.createElement('option');
        errorOption.text = 'Error al cargar informacion';
        trabaja.add(errorOption);
      });
  });

  campoProvincia2.addEventListener("change", function () {
    const provincia = campoProvincia2.value;
    const rol = campoRol.value;
    const pais = campoPais.value;
    document.getElementById('trabaja').removeAttribute("hidden");
    trabaja.innerHTML = '';
    fetch(`http://localhost:2000/auth/trabaja?provincia=${provincia}&rol=${rol}&pais=${pais}`)
      .then(response => response.json())
      .then(data => {
        trabaja.innerHTML = '';
        if (data && data.centros) {
          if (data.centros.length == 0) {
            const noOption = document.createElement('option');
            noOption.text = 'No se encontraron centros';
            trabaja.add(noOption);
          }
          data.centros.forEach(function (centro) {
            const newOption = document.createElement('option');
            newOption.value = centro.idCentro;
            newOption.text = centro.nombre;
            trabaja.add(newOption);
          });
        } else if (data && data.depositos) {
          if (data.depositos.length == 0) {
            const noOption = document.createElement('option');
            noOption.text = 'No se encontraron depositos';
            trabaja.add(noOption);
          }
          data.depositos.forEach(function (deposito) {
            const newOption = document.createElement('option');
            newOption.value = deposito.idDepProv;
            newOption.text = deposito.nombre;
            trabaja.add(newOption);
          });
        } else if (data && data.laboratorios) {
          if (data.laboratorios.length == 0) {
            const noOption = document.createElement('option');
            noOption.text = 'No se encontraron laboratorios';
            trabaja.add(noOption);
          }
          data.laboratorios.forEach(function (laboratorio) {
            const newOption = document.createElement('option');
            newOption.value = laboratorio.idLab;
            newOption.text = laboratorio.nombre;
            trabaja.add(newOption);
          });
        } else {
          const noOption = document.createElement('option');
          noOption.text = 'No se encontraron centros';
          trabaja.add(noOption);
        }
      })
      .catch(error => {
        trabaja.innerHTML = '';
        const errorOption = document.createElement('option');
        errorOption.text = 'Error al cargar informacion';
        trabaja.add(errorOption);
      });
  });
});