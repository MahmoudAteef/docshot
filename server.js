const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static('public'));

const csvFilePath = path.join(__dirname, 'userdata.csv');

if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Name,Phone,Address,ImageURL\n', 'utf8');
}

app.post('/save-csv', (req, res) => {
  const { name, phone, address, imageUrl } = req.body;

  const csvLine = `"${name}","${phone}","${address}","${imageUrl}"\n`;

  fs.appendFile(csvFilePath, csvLine, (err) => {
    if (err) {
      console.error('❌ Error writing to CSV:', err);
      return res.status(500).send('Failed to save data.');
    }
    res.send('✅ Data saved to CSV.');
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
