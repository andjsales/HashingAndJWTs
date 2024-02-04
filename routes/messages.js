const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const { ensureLoggedIn } = require("../middleware/auth");
const { Message } = require('./models/message');


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        const message = await Message.get(req.params.id);
        if (message.from_user.username !== req.user.username && message.to_user.username !== req.user.username) {
            res.status(403).send("Access Denied.");
        }
        res.json({ message });
    } catch (error) {
        res.status(error.status || 500).send(error.message);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const { to_username, body } = req.body;
        const from_username = req.user.username;
        const message = await Message.create({ from_username, to_username, body });
        res.json({ message });
    } catch (error) {
        res.status(error.status || 500).send(error.message);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, res) => {
    try {
        const id = req.params.id;
        const message = await Message.get(id);

        if (message.to_user.username !== req.user.username) {
            return res.status(403).send("Access denied.");
        }

        const readMessage = await Message.markRead(id);
        res.json({ readMessage });
    } catch (error) {
        res.status(error.status || 500).send(error.message);
    }
});


module.exports = router;
