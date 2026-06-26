I have completed a security audit of the provided repository. The analysis revealed critical security vulnerabilities that pose a severe risk to the application's integrity and confidentiality.

### Vulnerability Report

---

#### VULN-001: Remote Command Injection
*   **Title:** Unsanitized OS Command Execution
*   **CWE:** CWE-78: Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')
*   **Attacker Persona(s):** External Unauthenticated Attacker
*   **Severity:** Critical (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H - 9.8)
*   **Location:** `src/api.js`, function `runTask`, line 5
*   **Root Cause Analysis:** The application uses the `child_process.exec` function to execute system commands where the command string is directly constructed using unsanitized input from `req.query.cmd`. This allows an attacker to append arbitrary shell commands.
*   **Exploit Scenario / Proof of Concept:** An attacker could execute arbitrary commands by supplying them in the `cmd` query parameter. For example, a request to `?cmd=whoami` would return the user identity, or `?cmd=cat /etc/passwd` could leak system files.
*   **Code Evidence:**
    ```javascript
    function runTask(req, res) {
        exec(req.query.cmd, (err, stdout) => res.send(stdout));
    }
    ```
*   **Remediation:** Avoid executing OS commands based on user input. If necessary, use `child_process
