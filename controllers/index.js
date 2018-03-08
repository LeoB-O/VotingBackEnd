module.exports = {
    "GET /": async (ctx, next) => {
        ctx.response.body = "This is an test page!"
    }
}