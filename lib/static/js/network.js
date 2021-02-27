export class Network {
  makeApiRequest (method, module, data, type = 'json') {
    console.log('API Request %s', JSON.stringify(data))
    return new Promise((resolve, reject) => {
      $.ajax({
        dataType: type,
        url: '/' + module,
        data: data,
        method: method,
        success: (responseData) => {
          console.log('Result %s', JSON.stringify(responseData))
          resolve(responseData)
        },
        error: (error) => {
          console.log('Error %s', JSON.stringify(error))
          reject(error)
        }
      })
    })
  }
}
