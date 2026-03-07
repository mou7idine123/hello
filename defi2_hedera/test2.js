async function test() {
    console.log(await fetch('http://localhost:3000/api/log-impact', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ test: 1 }) }).then(r=>r.json()));
    console.log(await fetch('http://localhost:3000/api/log-impact', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ test: 2 }) }).then(r=>r.json()));
}
test();
