const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let balance = 1000000; // 1,000,000 chip mặc định
let history = [];

app.get('/api/state', (req, res) => {
  res.json({ balance, history });
});

app.post('/api/roll', (req, res) => {
  const { betAmount, choice } = req.body; // choice: 'tai' hoặc 'xiu'
  
  if (!betAmount || betAmount <= 0) {
    return res.status(400).json({ error: 'Số tiền cược không hợp lệ' });
  }
  if (betAmount > balance) {
    return res.status(400).json({ error: 'Số dư không đủ' });
  }
  if (choice !== 'tai' && choice !== 'xiu') {
    return res.status(400).json({ error: 'Lựa chọn không hợp lệ (phải là tai hoặc xiu)' });
  }

  // Roll 3 dice
  const dice = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ];
  const total = dice[0] + dice[1] + dice[2];
  const result = total >= 11 && total <= 17 ? 'tai' : 'xiu';
  const win = choice === result;

  if (win) {
    balance += betAmount;
  } else {
    balance -= betAmount;
  }

  const record = {
    id: Date.now(),
    dice,
    total,
    result,
    choice,
    betAmount,
    win,
    timestamp: new Date().toLocaleTimeString()
  };

  history.unshift(record);
  if (history.length > 20) {
    history.pop();
  }

  res.json({
    dice,
    total,
    result,
    win,
    balance,
    history
  });
});

app.post('/api/reset', (req, res) => {
  balance = 1000000;
  history = [];
  res.json({ balance, history });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server đang chạy ở port ${PORT}`);
});
