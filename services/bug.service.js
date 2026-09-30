import fs from 'fs'

import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const bugService = {
    query,
    getById,
    remove,
    save
}

const bugs = utilService.readJsonFile('data/bug.json')

function query(queryOptions) {
    const results = {}
    const { filterBy, sortBy, pagination } = queryOptions
    var bugsToReturn = [ ...bugs ]

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugsToReturn = 
            bugsToReturn.filter(bug => regExp.test(bug.title))
    }

    if (filterBy.minSeverity) {
        bugsToReturn = 
            bugsToReturn.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
        bugsToReturn = 
            bugsToReturn.filter(bug => 
                filterBy.labels.some(label => bug.labels?.includes(label)))
    }

    if (sortBy.sortField === 'severity' || sortBy.sortField === 'createdAt') {
        const { sortField } = sortBy

        bugsToReturn.sort((bug1, bug2) => 
            (bug1[sortField] - bug2[sortField]) * sortBy.sortDir)
    } else if (sortBy.sortField === 'title') {
        bugsToReturn.sort((bug1, bug2) => 
            (bug1.title.localeCompare(bug2.title)) * sortBy.sortDir)
    } 

    if (pagination.pageIdx !== undefined) {
        const { pageIdx, pageSize } = pagination
        const startIdx = pageIdx * pageSize
        
        results.pageCount = Math.ceil(bugsToReturn.length / pageSize)
        bugsToReturn = bugsToReturn.slice(startIdx, startIdx + pageSize)
    }

    results.bugs = bugsToReturn
    return Promise.resolve(results)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Bug not found!')
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    bugs.splice(idx, 1)
    return _saveBugsToFile()
}

function save(bug) {
    if (bug._id) {
        const idx = bugs.findIndex(currBug => currBug._id === bug._id)
        bugs[idx] = { ...bugs[idx], ...bug }
    } else {
        bug._id = utilService.makeId()
        bug.createdAt = Date.now()
        bugs.unshift(bug)
    }
    return _saveBugsToFile()
        .then(() => bug)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 2)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to bugs file', err)
                return reject(err);
            }
            resolve()
        });
    })
}

