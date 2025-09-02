const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_, res) => res.send('Hello from CI/CD with Jenkins + Docker + Trivy!'));

app.listen(port, () => console.log(`App listening on port ${port}`));
