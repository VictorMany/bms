import service from 'src/api/equipments'

export async function getEquipmentsAction(context, params) {
    return service.getEquipments(params).then(async (response) => {
        if (response.status == 200) {
            context.commit('MUTATE_EQUIPMENTS', response.data.contents.equipments)
            context.commit('MUTATE_DETAILS', response.data.contents)
            return true
        }
        else {
            return response
        }
    })
}

export async function getEquipmentAction(context, params) {
    return service.getEquipment(params.id).then(async (response) => {
        if (response.status == 200) {
            // We call the global action to format our payload
            const equipment = response.data.contents.equipment

            const categoryName = `${equipment.equipmentName} - ${equipment.equipmentModel} - No. serie: ${equipment.serialNumber}`
            const IdEquipment = params.id

            const {
                serialNumber,
                equipmentModel,
                equipmentName,
                equipmentBrand,
                equipmentStatus,
                photo
            } = equipment

            context.commit('MUTATE_EQUIPMENT', {
                serialNumber,
                equipmentModel,
                equipmentName,
                equipmentBrand,
                equipmentStatus,
                photo,
                categoryName,
                IdEquipment
            })

            if (params.fields) {
                await context.dispatch('global/formatDetails', {
                    keys: response.data.contents.equipment,
                    fields: params.fields
                }, { root: true });
            }

            return equipment
        } else {
            return response
        }
    })
}

export async function postEquipmentAction(context, equipment) {
    // Those are the keys you need in your payload and find in the fields
    let keys = {
        equipmentBrand: '',
        equipmentModel: '',
        CategoryId: '',
        LocationId: '',
        location: '',
        manufacturingYear: '',
        observations: '',
        price: '',
        provider: '',
        serialNumber: '',
        trackingNumber: '',
        warrantyDate: '',
        acquisitionDate: '',
        photo: ''
    }

    // We call the global action to format our payload
    const payload = await context.dispatch('global/formatPayload', {
        keys,
        fields: equipment
    }, { root: true });

    return await service.postEquipment(payload).then(async (response) => {
        if (response.status == 201) {
            return true
        } else {
            return response
        }
    })
}

export async function updateEquipmentAction(context, equipment) {
    // Those are the keys you need in your payload and find in the fields
    let keys = {
        equipmentStatus: '',
        LocationId: '',
        observations: '',
        serialNumber: '',
        trackingNumber: '',
        warrantyDate: '',
        price: '',
        provider: '',
        acquisitionDate: '',
        photo: ''
    }

    // We call the global action to format our payload
    const payload = await context.dispatch('global/formatPayload', {
        keys,
        fields: equipment,
    }, { root: true });

    // If we dont have any changes 
    if (payload.entries().next().done) {
        return true
    } else {
        return await service.updateEquipment(payload, equipment.id).then(async (response) => {
            if (response.status == 200) {
                return true
            } else {
                return response
            }
        })
    }
}