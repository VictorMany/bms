export function changeMenu(context) {
    context.commit('CHANGE_MENU')
}

export function formatPayload(context, { keys, fields }) {
    const fd = new FormData();
    const updatedObj = {}

    for (let k in keys) {
        for (let prop in fields) {
            if (Array.isArray(fields[prop])) {
                for (let i = 0; i < fields[prop].length; i++) {
                    for (let key in fields[prop][i]) {
                        if (k == fields[prop][i][key]) {
                            // Verificar si la clave ya existe en FormData
                            if (!fd.has(k)) {
                                if (fields[prop][i].type === 'select' || fields[prop][i].type === 'autocomplete') {
                                    if (typeof fields[prop][i].model == 'string') {
                                        fd.append(k, fields[prop][i].model)
                                        updatedObj[k] = fields[prop][i].model
                                    } else {
                                        fd.append(k, fields[prop][i].model?.value);
                                        updatedObj[k] = fields[prop][i].model?.value
                                    }
                                } else {
                                    fd.append(k, fields[prop][i].model);
                                    updatedObj[k] = fields[prop][i].model
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (fields.originalObj) {
        return updatePayload(fields.originalObj, updatedObj, fd)
    } else {
        return fd
    }
}

function updatePayload(original, toUpdate, fd) {
    for (const key in toUpdate) {
        if (Object.prototype.hasOwnProperty.call(toUpdate, key)) {
            if (Object.prototype.hasOwnProperty.call(original, key)) {
                if (original[key] == toUpdate[key]) {
                    delete toUpdate[key];
                    fd.delete(key);
                }
            }
        }
    }
    return fd;
}

export async function formatDetails(context, { keys, fields }) {
    fields.createdAt = formatDate(keys.createdAt);

    for (let k in keys) {
        for (let prop in fields) {
            if (Array.isArray(fields[prop])) {
                for (let i = 0; i < fields[prop].length; i++) {
                    for (let key in fields[prop][i]) {
                        if (k == fields[prop][i][key]) {
                            fields[prop][i] = getModelSelected(fields[prop][i], keys[k])
                        }
                    }
                }
            }
        }
    }

    if (keys.User) {
        updateFieldByKeyInAllArrays(fields, 'userName', {
            model: keys.User.userName
        })
    }

    if (keys.Equipment) {
        updateFieldByKeyInAllArrays(fields, 'categoryName', {
            model: keys.Equipment.categoryName
        })

        updateFieldByKeyInAllArrays(fields, 'equipmentName', {
            model: keys.Equipment.equipmentName
        })

        updateFieldByKeyInAllArrays(fields, 'equipmentModel', {
            model: keys.Equipment.equipmentModel
        })

        updateFieldByKeyInAllArrays(fields, 'serialNumber', {
            model: keys.Equipment.serialNumber
        })

        updateFieldByKeyInAllArrays(fields, 'photo', {
            model: keys.Equipment.photo
        })

        updateFieldByKeyInAllArrays(fields, 'equipmentBrand', {
            model: keys.Equipment.equipmentBrand
        })

        updateFieldByKeyInAllArrays(fields, 'locationName', {
            model: keys.Equipment.locationName
        })
    }

    return fields;
}

export function addGlobalsToLocalStorage(context, newData) {
    context.commit('UPDATE_LOCAL_STORAGE', newData)
}

export function changeIsDark(context, newData) {
    context.commit('UPDATE_IS_DARK', newData)
}

export function formatDate(dateString) {
    if (dateString) {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            // Si la conversión a fecha falla, retorna una cadena vacía
            return '';
        }

        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const monthsOfYear = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        const dayOfWeek = daysOfWeek[date.getDay()];
        const dayOfMonth = date.getDate();
        const month = monthsOfYear[date.getMonth()];
        const year = date.getFullYear();

        let hour = date.getHours();
        const minute = date.getMinutes();
        const ampm = hour >= 12 ? 'pm' : 'am';
        hour = hour % 12;
        hour = hour ? hour : 12; // Convertir 0 a 12 en formato de 12 horas

        const formattedDate = `${dayOfWeek} ${dayOfMonth} de ${month} del ${year} a las ${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;

        return formattedDate;
    } else {
        return '';
    }
}

export function formatDateOnly(dateString) {
    if (dateString) {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            // Si la conversión a fecha falla, retorna una cadena vacía
            return '';
        }

        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const monthsOfYear = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        date.setUTCHours(date.getUTCHours() + 6);
        const dayOfWeek = daysOfWeek[date.getDay()];
        const dayOfMonth = date.getDate();
        const month = monthsOfYear[date.getMonth()];
        const year = date.getFullYear();

        const formattedDate = `${dayOfWeek} ${dayOfMonth} de ${month} del ${year}`;

        return formattedDate;
    } else {
        return '';
    }
}

function getModelSelected(item, valueFromServer) {
    if (item.options && item.options.length > 0) {
        item.options.forEach(opt => {
            if (opt.value == valueFromServer) {
                item.model = opt
            }
        });
        return item
    } else if (item.label == 'Estatus' && item.key != 'reportStatus') {
        if (valueFromServer) {
            item.model = 'Activo'
            item.color = '#10D13A'
        } else {
            item.model = 'Inactivo'
            item.color = '#dc4e5f'
        }
        return item
    } else if (item.key == 'reportStatus') {
        if (valueFromServer == 'Pendiente') {
            item.color = '#FF9900'
        } else if (valueFromServer == 'Resuelto') {
            item.color = '#1e65e8'
        } else if (valueFromServer == 'Cancelado') {
            item.color = '#dc4e5f'
        }
        item.model = valueFromServer

        return item
    } else if (item.key == 'maintenanceType') {
        if (valueFromServer === 'Preventivo') {
            item.model = 'Preventivo'
            item.color = '#10D13A'
        } else {
            item.model = 'Correctivo'
            item.color = '#d1b410'
        }
        return item
    } else if (item.key == 'userRole') {
        switch (valueFromServer) {
            case 1:
                item.model = 'Administrador'
                break;
            case 2:
                item.model = 'Auxiliar'
                break;
            case 3:
                item.model = 'Expectador'
                break;
        }
        return item
    } else if (item.type == 'formatedDate') {
        item.model = formatDate(valueFromServer);
    } else if (item.type == 'formatedDateOnly') {
        item.model = formatDateOnly(valueFromServer);
    } else if (item.key == 'isReported') {
        item.model = valueFromServer ? item.model = 'Si' : item.model = 'Sin reportes'
        return item
    }
    else item.model = valueFromServer
    return item
}

function updateFieldByKeyInAllArrays(fields, key, updates) {
    for (const arrayKey in fields) {
        if (Array.isArray(fields[arrayKey])) {
            const fieldEntry = fields[arrayKey].find(entry => entry.key === key);
            if (fieldEntry) {
                Object.assign(fieldEntry, updates);
                return; // Termina la iteración después de encontrar la primera coincidencia
            }
        }
    }
    console.log(`No se encontró la entrada para la clave '${key}' en ningún arreglo o no tiene opciones.`);
}