const exec = require("child_process").exec;
const pwd = "admin_super_secret";
function runTask(req, res) {
    exec(req.query.cmd, (err, stdout) => res.send(stdout));
}
