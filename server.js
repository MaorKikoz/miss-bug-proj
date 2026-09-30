import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'

const app = express()

// App Configuration
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug', (req, res) => {
    const queryOptions = parseQueryParams(req.query)

	bugService.query(queryOptions)
		.then(bugs => {
			res.send(bugs)
		})
		.catch(err => {
			loggerService.error('Cannot get bugs', err)
			res.status(400).send('Cannot get bugs')
		})
})

function parseQueryParams(queryParams) {
    const filterBy = {
        txt: queryParams.txt || '',
        minSeverity: +queryParams.minSeverity || 0,
        labels: queryParams.labels || [],
    }

    const sortBy = {
        sortField: queryParams.sortField || '',
        sortDir: +queryParams.sortDir || 1,
    }
    
    const pagination = {
        pageIdx: queryParams.pageIdx !== undefined ? +queryParams.pageIdx || 0 : queryParams.pageIdx,
        pageSize: +queryParams.pageSize || 3,
    }

    return { filterBy, sortBy, pagination }
}

app.get('/api/bug/:bugId', (req, res) => {
	const { bugId } = req.params
	const { visitCountMap = [] } = req.cookies

    if (!visitCountMap.includes(bugId)) {
        if (visitCountMap.length === 3) {
            return res.status(401).send('Wait for a bit')
        } else {
            visitCountMap.push(bugId)
        }
    }

	res.cookie('visitCountMap', visitCountMap, { maxAge: 1000 * 7 })
    console.log('visitCountMap: ', visitCountMap)

	bugService.getById(bugId)
		.then(bug => res.send(bug))
		.catch(err => {
			loggerService.error('Cannot get bug', err)
			res.status(400).send('Cannot get bug')
		})
})

app.post('/api/bug', (req, res) => {
	const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not Authenticated')
	const { title, description, severity, labels } = req.body

    if (!title || severity === undefined) return res.status(400).send('Missing required fields')

	const bug = {
        title,
		description,
		severity: +severity || 1,
        labels: labels || [],
	}

	bugService.save(bug)
		.then(savedBug => {
			res.send(savedBug)
		})
		.catch(err => {
			loggerService.error('Cannot save bug', err)
			res.status(400).send('Cannot save bug')
		})
})

app.put('/api/bug/:bugId', (req, res) => {
	const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not Authenticated')
	const { title, description, severity, labels, _id } = req.body
    
    if ( !_id || !title || severity === undefined) return res.status(400).send('Missing required fields')
    const bug = {
		_id,
		title,
		description,
		severity: +severity,
        labels: labels || [],
	}

	bugService.save(bug)
		.then(savedBug => {
			res.send(savedBug)
		})
		.catch(err => {
			loggerService.error('Cannot save bug', err)
			res.status(400).send('Cannot save bug')
		})
})

app.delete('/api/bug/:bugId', (req, res) => {
	const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not Authenticated')
	
	const { bugId } = req.params

	bugService.remove(bugId)
		.then(() => {
			loggerService.info(`Bug ${bugId} removed`)
			res.send('Removed!')
		})
		.catch(err => {
			loggerService.error('Cannot get bug', err)
			res.status(400).send('Cannot get bug')
		})
})

app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})

// Auth API
app.post('/api/auth/login', (req, res) => {
    const credentials = req.body

    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    
    userService.add(credentials)
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
        .catch(err => res.status(400).send('Username taken.'))
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})


app.get('/echo-cookies', (req, res) => {
    var cookieCount = 0
    var resStr = ''

    for (const cookie in req.cookies) {
        const cookieStr = `${cookie}: ${req.cookies[cookie]}`
        console.log(cookieStr)
        
        resStr += cookieStr + '\n'
        cookieCount++
    }
    resStr += `Total ${cookieCount} cookies`
    res.send(resStr)
})

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))
