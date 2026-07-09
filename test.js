async function test() {
    try {
        const res = await fetch('http://localhost:4000/api/v1/user/sign-up', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                fullName: "Akhilesh Gond",
                email: "test99@example.com",
                password: "password123"
            })
        });
        console.log("Signup success:", res.headers.get('set-cookie'));
        
        const loginRes = await fetch('http://localhost:4000/api/v1/user/sign-in', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: "test99@example.com",
                password: "password123"
            })
        });
        console.log("Login success:", loginRes.headers.get('set-cookie'));
    } catch(err) {
        console.log("Error:", err.message);
    }
}
test();
