const Express = require('express')
const bdb = require('bdb.js')
const posts = bdb.load('posts.json', 1)

const webname = 'TheForum'
const email = null

const server = new Express()

server.set('view engine', 'ejs')

function replace(req, regex, repl) {
    const url = req.url.replaceAll(regex, repl)
    console.log(url)
    const parsedUrl = new URL('http://localhost' + url)
    req.url = url
    req.originalUrl = url
    req.path = parsedUrl.pathname
    req.search = parsedUrl.search
    req._parsedUrl = parsedUrl
    const query = {}
    for(const entry of parsedUrl.searchParams) {
        query[entry[0]] = entry[1]
    }
    req.query = query
}

server.use(function replacer(req, res, next) {
    replace(req, /^\/post\/([0-9]+)_?/g, '/post?id=$1')
    replace(req, /^\/comment\/([0-9_]+)\/([0-9_]*)(\?(.*))?/g, '/comment?id=$1&comment=$2&$4')
    next()
})

server.use(require('body-parser').urlencoded({extended: false}))


server.all('/', function get(req, res) {
    const fake = req.body.fake === 'yes'
    let mainPage = {author: webname, title: 'All posts', content: 'These are all the posts on the board:', comments: []}
    for (let i = 0; i < posts.length && i < 2000; i++) {
        mainPage.comments.push({timestamp: posts[i].timestamp, author: posts[i].author, title: posts[i].title, content: posts[i].content, comments: []}) 
    }
    if(req.body.name && req.body.title && req.body.content) {
        let post = {timestamp: new Date().getTime(), author: req.body.name, title: req.body.title, content: req.body.content.replaceAll('\r\n', '\n'), comments: []}
        if(fake) {
            mainPage.comments.push(post)
            res.render('post.ejs', {post: mainPage, postid: '-1', webname: webname, email: email, comment: '', fake: true})
        } else {
            posts.push(post)
            res.redirect(`/`)
        }
        return
    }
    res.render('post.ejs', {post: mainPage, postid: '-1', webname: webname, email: email, comment: '', fake: false})
})
server.get('/post', function get(req, res) {
    if(req.query.id) {
        let id = req.query.id
        if(posts[id]) {
            res.render('post.ejs', {post: posts[id], postid: id, webname: webname, email: email, comment: null})
        }
    }
})
server.all('/comment', function get(req, res) {
    if(req.query.id) {
        let id = req.query.id
        let comment = req.query.comment 
        if(posts[id]) {
            const fake = req.body.fake === 'yes'
            let toRemove = null
            let cid = ''
            try {
                function recurse(post) {
                    console.log(String(cid) + ' ' + comment)
                    if(String(cid) === comment) {
                        if(req.body.name && req.body.title && req.body.content) { 
                            post.comments.push({timestamp: new Date().getTime(), author: req.body.name, title: req.body.title, content: req.body.content.replaceAll('\r\n', '\n'), comments: []})
                            if(fake) {
                                res.render('post.ejs', {post: posts[id], postid: id, webname: webname, email: email, comment: cid, fake: fake})
                                toRemove = post
                            } else
                                res.redirect(`/post/${id}`)
                            cid = -1
                        }
                        return true
                    }
                    for(let i = 0; i < post.comments.length; i++) {
                        const pid = cid
                        cid += i + '_'
                        if(recurse(post.comments[i]))
                            return true
                        cid = pid
                    }
                    return false
                }
                const f = recurse(posts[id]);
                if(f && cid == -1)
                    return
                if(f) {
                    res.render('post.ejs', {post: posts[id], postid: id, webname: webname, email: email, comment: cid, fake: fake})
                }
                else {
                    if(req.body.name && req.body.title && req.body.content) { 
                        posts[id].comments.push({timestamp: new Date().getTime(), author: req.body.name, title: req.body.title, content: req.body.content.replaceAll('\r\n', '\n'), comments: []})
                        if(fake) {
                            res.render('post.ejs', {post: posts[id], postid: id, webname: webname, email: email, comment: cid, fake: fake})
                            toRemove = posts[id]
                        } else
                            res.redirect(`/post/${id}`)
                    }
                    else
                        res.render('post.ejs', {post: posts[id], postid: id, webname: webname, email: email, comment: ''})
                }
            } finally {
                if(fake) {
                    toRemove.comments.pop()
                }
            }
        }
    }
    else
        res.send("err1")
})

let PORT = process.argv[2]
if(!PORT) PORT = process.env.PORT
if(!PORT) PORT = 8080
server.listen(Number(PORT), () => console.log(PORT))
