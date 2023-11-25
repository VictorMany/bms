import service from 'src/api/users'

export function getUsersAction(context){
    return service.getUsers().then(async (response) => {
        if (response.status == 200) {
            context.commit('MUTATE_USERS', response.data.contents)
            context.commit('MUTATE_DETAILS', response.data)
            return manageResponse('Obtener usuarios', true)
        } else {
            return manageResponse('Obtener usuarios', false)
        }
    })
}

export function postUserAction(context, user){
    return service.postUser(formatUser(user)).then(async (response) => {
        try {
            if (response.status == 201) {
                console.log(response.data);
                context.commit('ADD_USERS', response.data)    // mutamos el arreglo local y agregamos el nuevo usuario, de manera que no consultamos la base de datos
                return manageResponse('Añadir usuario', true)
            } else {
                return manageResponse('Añadir usuario', false)
            }
        } catch (error) {
            return manageResponse(error, false)
        }
    })
}

const manageResponse = (scope, success) => {
    if (success) {
        return {
            scope,
            message: 'Operación realizada exitosamente',
            success
        }
    } else {
        return {
            scope,
            message: 'Ha ocurrido un error al realizar la operación ',
            success
        }
    }
}

const formatUser = (user) => {
    let formatedUser = {
        userName: user.top[0].model,
        email: user.top[1].model,
        userPassword: user.left[1].model,
        phone: user.left[0].model,
        userRole: user.left[3].model.index,
        photo: user.top[0].model,
        userStatus: user.left[4].model.status,
        birthday: user.left[2]
    }
    return formatedUser
}