const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getLabels,
}

function query(queryOptions) {
    return axios.get(BASE_URL, { params: queryOptions })
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
}

function save(bug) {
    const method = bug._id ? 'put' : 'post'
    const bugId = bug._id || ''

    return axios[method](BASE_URL + bugId, bug)
        .then(res => res.data)
        
    // if (bug._id) {
    //     return axios.put(BASE_URL + bug._id, bug)
    //         .then(res => res.data)
    // } else {
    //     return axios.post(BASE_URL, bug)
    //         .then(res => res.data)
    // }
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, labels: [], sortField: '', sortDir: 1 }
}

function getLabels() {
    return [
        'back', 'front', 'critical', 'fixed', 'in progress', 'stuck'
    ]
}