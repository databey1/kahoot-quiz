import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, Zap, LogOut, Play, Eye } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCWomiP6AUe13iKexXZAPibxvi67zrY11A",
  authDomain: "ramoot-game.firebaseapp.com",
  databaseURL: "https://ramoot-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ramoot-game",
  storageBucket: "ramoot-game.firebasestorage.app",
  messagingSenderId: "403149392724",
  appId: "1:403149392724:web:36fbcff884eec5bac6d6c1"
};

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.log('Firebase init error:', e);
}

const QUESTIONS = [
  { id: 1, questionText: "Ditching esnasında tüm sınıfı raft'e çekerken tüm gün ayak görüp yorgunluktan ve nefessizlikten inkapasite olan kimdir?", options: ["Cansu", "İlkay", "Aleyna", "Ezher"], correctAnswerIndex: 1, points: 1000 },
  { id: 2, questionText: "Fındık anonsunu son dakika değişikliği ile anons kitabına ekleten kimdir?", options: ["Aylin", "Serkan", "Kübra", "Gürkan"], correctAnswerIndex: 3, points: 1000 },
  { id: 3, questionText: "Yolcu acil olarak işemeye çalışırken PDF'e göre karar veren kimdi?", options: ["Rana", "Fadime", "Ramazan", "Berke"], correctAnswerIndex: 2, points: 1000 },
  { id: 4, questionText: "Arnavutköy isimli zehirli oku İLK sıkan kimdir?", options: ["Fadime", "Zeynep", "Kübra", "Mert"], correctAnswerIndex: 2, points: 1000 },
  { id: 5, questionText: "Ev kiralarıyla oto galeri açmaya yemin etmiş ekip arkadaşımız kimdir?", options: ["Hatice", "Hatice Kübra", "Özlem", "Mert"], correctAnswerIndex: 3, points: 1000 },
  { id: 6, questionText: "Allahın hakkı üçtür diyip her sınava 3 kere kim girmişti?", options: ["Aylin", "Rana", "Aleyna", "Oğuzhan"], correctAnswerIndex: 0, points: 1000 },
  { id: 7, questionText: "Yangın tiplerine yeni bir soluk getirerek 'alpha türü' yangını jargona sokan kimdi?", options: ["Ezher", "Fadime", "Özlem", "Gürkan"], correctAnswerIndex: 0, points: 1000 },
  { id: 8, questionText: "Sınıfımızın Ankaralı zengin ismi kimdir?", options: ["İlkay", "Rana", "Gürkan", "Ezher"], correctAnswerIndex: 1, points: 1000 },
  { id: 9, questionText: "Üniversiteyi 4.sınıfta dondurduğuna şerefi ve namusu üzerine yemin eden arkadaşımız kimdir?", options: ["Özlem", "Zeynep", "Berke", "Ramazan"], correctAnswerIndex: 0, points: 1000 },
  { id: 10, questionText: "Bu testi çözerken bile duygulanıp ağlama ihtimali olan kimdir?", options: ["Kübra", "Hatice Kübra", "Hatice", "Aleyna"], correctAnswerIndex: 3, points: 1000 },
  { id: 11, questionText: "Bizi manitadan ayrı düşünmeyip sabahları gruba güno aşkım mesajı atan kimdir?", options: ["Mert", "Oğuz", "Berke", "Gürkan"], correctAnswerIndex: 2, points: 1000 },
  { id: 12, questionText: "Japonya'da anime festivallerinde edindiği CRM becerileriyle derste halka problemini tekte çözen kimdir?", options: ["Ramazan", "Kübra", "Berke", "Cansu"], correctAnswerIndex: 3, points: 1000 },
  { id: 13, questionText: "İş çıkışı piercing ve sayısız küpeyle hardcore death metalci takılan arkadaşımız kimdir", options: ["Rana", "Fadime", "Zeynep", "Aylin"], correctAnswerIndex: 2, points: 1000 },
  { id: 14, questionText: "Görme engelli yolcuya bağırarak dudaklarımı görebiliyor musun diyen kimdir?", options: ["İlkay", "Serkan", "Oğuz", "Mert"], correctAnswerIndex: 2, points: 1000 },
  { id: 15, questionText: "Apronda babadan yadigar doblosuyla sıfır çizmek isteyen kimdir?", options: ["Hatice Kübra", "Ramazan", "Gürkan", "Hatice"], correctAnswerIndex: 3, points: 1000 },
  { id: 16, questionText: "Ders çalışma bahanesiyle tüm sınıfı sürekli Gloria Jeanse götürüp şubeden kar payı alan kimdir?", options: ["Aleyna", "Fadime", "Ezher", "Rana"], correctAnswerIndex: 1, points: 1000 },
  { id: 17, questionText: "Rusyanın eşsiz bucaksız tundralarından, Ciddenin kavurucu sıcaklarına kadar tüm coğrafya bilgisini bize aktaran kişi kimdir?", options: ["Hatice Kübra", "Gürkan", "Ezher", "İlkay"], correctAnswerIndex: 0, points: 1000 },
  { id: 18, questionText: "Uğur Dündar gibi araştırmacı gazeteci, Picasso gibi soyut bir ressam ve İngiltere Kralı gibi İngilicce bilen kimdir?", options: ["Zeynep", "Cansu", "Serkan", "Oğuz"], correctAnswerIndex: 2, points: 1000 },
];

export default function MultiplayerGame() {
  const [mode, setMode] = useState('modeSelect');
  const [userName, setUserName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [gameId, setGameId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [players, setPlayers] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [gameState, setGameState] = useState('waiting');
  const [playerId, setPlayerId] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const startHostGame = async () => {
    if (!userName.trim() || !db) return;
    const code = generateGameCode();
    setGameId(code);
    setGameCode(code);

    try {
      await set(ref(db, `games/${code}`), {
        host: userName,
        currentQuestion: 0,
        gameState: 'waiting',
        createdAt: Date.now(),
      });
      setMode('hostGame');
      listenToHostGame(code);
    } catch (e) {
      console.error('Error starting game:', e);
      alert('Oyun başlatılamadı!');
    }
  };

  const joinGame = async () => {
    if (!userName.trim() || !gameCode.trim() || !db) return;

    const code = gameCode.toUpperCase();
    try {
      const gameRef = ref(db, `games/${code}`);
      const gameSnap = await get(gameRef);

      if (!gameSnap.exists()) {
        alert('Oyun bulunamadı!');
        return;
      }

      const id = `${userName}-${Date.now()}`;
      setPlayerId(id);
      setGameId(code);

      await set(ref(db, `games/${code}/players/${id}`), {
        name: userName,
        score: 0,
        answered: false,
        answer: null,
      });

      setMode('playerGame');
      listenToPlayerGame(code, id);
    } catch (e) {
      console.error('Error joining game:', e);
      alert('Oyuna katılamadı!');
    }
  };

  const listenToHostGame = (code) => {
    onValue(ref(db, `games/${code}`), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCurrentQuestion(data.currentQuestion || 0);
        setGameState(data.gameState || 'waiting');
      }
    });

    onValue(ref(db, `games/${code}/players`), (snapshot) => {
      if (snapshot.exists()) {
        const playersData = snapshot.val();
        const playersList = Object.entries(playersData).map(([id, data]) => ({
          id,
          ...data,
        }));
        setPlayers(playersList.sort((a, b) => b.score - a.score));
      }
    });
  };

  const listenToPlayerGame = (code, id) => {
    onValue(ref(db, `games/${code}`), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCurrentQuestion(data.currentQuestion || 0);
        setGameState(data.gameState || 'waiting');
      }
    });

    onValue(ref(db, `games/${code}/players`), (snapshot) => {
      if (snapshot.exists()) {
        const playersData = snapshot.val();
        const playersList = Object.entries(playersData).map(([pid, data]) => ({
          id: pid,
          ...data,
        }));
        setPlayers(playersList.sort((a, b) => b.score - a.score));
        const me = playersData[id];
        if (me) {
          setMyScore(me.score || 0);
          setAnswered(me.answered || false);
          setSelectedAnswer(me.answer);
        }
      }
    });
  };

  const hostShowQuestion = async () => {
    await set(ref(db, `games/${gameId}/gameState`), 'question');
  };

  const hostShowAnswer = async () => {
    await set(ref(db, `games/${gameId}/gameState`), 'showing');
  };

  const hostNextQuestion = async () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      await set(ref(db, `games/${gameId}/currentQuestion`), currentQuestion + 1);
      await set(ref(db, `games/${gameId}/gameState`), 'waiting');

      const snapshot = await get(ref(db, `games/${gameId}/players`));
      if (snapshot.exists()) {
        const playersData = snapshot.val();
        for (const pid in playersData) {
          await set(ref(db, `games/${gameId}/players/${pid}/answered`), false);
          await set(ref(db, `games/${gameId}/players/${pid}/answer`), null);
        }
      }
    } else {
      await remove(ref(db, `games/${gameId}`));
      setMode('modeSelect');
    }
  };

  const playerSubmitAnswer = async (answerIndex) => {
    if (answered || !db) return;

    const question = QUESTIONS[currentQuestion];
    const isCorrect = answerIndex === question.correctAnswerIndex;

    try {
      await set(ref(db, `games/${gameId}/players/${playerId}/answer`), answerIndex);
      await set(ref(db, `games/${gameId}/players/${playerId}/answered`), true);

      if (isCorrect) {
        const newScore = myScore + question.points + 500;
        await set(ref(db, `games/${gameId}/players/${playerId}/score`), newScore);
      }

      setSelectedAnswer(answerIndex);
      setAnswered(true);
    } catch (e) {
      console.error('Error submitting answer:', e);
    }
  };

  if (!mounted || !db) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center">
        <div className="text-white text-center text-2xl font-black">
          Yükleniyor...
        </div>
      </div>
    );
  }

  const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
  const question = QUESTIONS[currentQuestion];

  if (mode === 'modeSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md w-full">
          <h1 className="text-7xl font-black text-white drop-shadow-2xl">RAMOOT!</h1>
          <p className="text-2xl text-white/90 font-semibold">TEMEL 13 GERÇEK BİTİRME SINAVI 🎉</p>

          <input
            type="text"
            placeholder="Adını gir..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-6 py-4 rounded-full text-xl font-bold text-center border-4 border-white/50 bg-white/20 text-white placeholder-white/50"
          />
          
          <button
            onClick={() => setMode('hostSetup')}
            className="w-full bg-white text-purple-600 px-8 py-4 rounded-full text-xl font-black hover:scale-105 transition-transform"
          >
            Oyun Başlat
          </button>

          <button
            onClick={() => setMode('playerSetup')}
            className="w-full bg-blue-500 text-white px-8 py-4 rounded-full text-xl font-black hover:scale-105 transition-transform"
          >
            Oyuna Katıl
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'hostSetup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md w-full">
          <h1 className="text-5xl font-black text-white">Oyun Başlat</h1>
          <button
            onClick={startHostGame}
            className="w-full bg-white text-green-600 px-8 py-6 rounded-full text-2xl font-black hover:scale-110 transition-transform"
          >
            Başla 🚀
          </button>
          <button
            onClick={() => setMode('modeSelect')}
            className="w-full bg-red-500 text-white px-8 py-4 rounded-full text-xl font-black"
          >
            Geri
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'playerSetup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md w-full">
          <h1 className="text-5xl font-black text-white">Oyuna Katıl</h1>
          <input
            type="text"
            placeholder="Kod"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            maxLength={4}
            className="w-full px-6 py-4 rounded-full text-3xl font-black text-center border-4 border-white/50 bg-white/20 text-white"
          />
          <button
            onClick={joinGame}
            className="w-full bg-white text-orange-600 px-8 py-6 rounded-full text-2xl font-black hover:scale-110 transition-transform"
          >
            Katıl ✓
          </button>
          <button
            onClick={() => setMode('modeSelect')}
            className="w-full bg-red-500 text-white px-8 py-4 rounded-full text-xl font-black"
          >
            Geri
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'hostGame') {
    const answeredCount = players.filter((p) => p.answered).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 text-white text-center">
            <p className="text-2xl font-black">Kod: <span className="text-yellow-300 text-4xl">{gameCode}</span></p>
            <p className="text-xl mt-2">{players.length} oyuncu | {answeredCount} cevapladı</p>
          </div>

          <div className="bg-white rounded-3xl p-8 mb-6">
            <h2 className="text-3xl font-black text-gray-800 text-center mb-6">
              Soru {currentQuestion + 1}/{QUESTIONS.length}
            </h2>
            <p className="text-2xl font-bold text-gray-800 text-center">{question.questionText}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {question.options.map((option, idx) => (
              <div key={idx} className={`${COLORS[idx]} text-white p-6 rounded-2xl text-xl font-black text-center`}>
                {option}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {gameState === 'waiting' && (
              <button
                onClick={hostShowQuestion}
                className="col-span-3 bg-yellow-400 text-gray-800 px-6 py-4 rounded-full text-xl font-black hover:scale-105"
              >
                Soruyu Göster
              </button>
            )}
            {gameState === 'question' && (
              <button
                onClick={hostShowAnswer}
                className="col-span-3 bg-orange-500 text-white px-6 py-4 rounded-full text-xl font-black hover:scale-105"
              >
                Sonucu Göster
              </button>
            )}
            {gameState === 'showing' && (
              <>
                <div className="col-span-3 bg-green-500 text-white p-4 rounded-2xl text-center font-black">
                  Doğru: {question.options[question.correctAnswerIndex]}
                </div>
                <button
                  onClick={hostNextQuestion}
                  className="bg-blue-500 text-white px-6 py-4 rounded-full text-xl font-black hover:scale-105"
                >
                  Sonraki
                </button>
              </>
            )}
          </div>

          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6">
            <h3 className="text-white text-2xl font-black mb-4">Sıralama</h3>
            <div className="space-y-2">
              {players.slice(0, 10).map((p, idx) => (
                <div key={p.id} className="flex justify-between items-center bg-white/20 p-3 rounded-lg text-white font-bold">
                  <span>{idx + 1}. {p.name}</span>
                  <span className="text-yellow-300">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'playerGame') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/20 rounded-2xl p-4 mb-6 flex justify-between items-center">
            <div className="text-white">
              <p className="font-bold">{userName}</p>
              <p className="text-sm">Soru {currentQuestion + 1}/{QUESTIONS.length}</p>
            </div>
            <div className="flex items-center gap-4 text-white font-black text-2xl">
              <div>📊 {myScore}</div>
              <div>{players.length} 👥</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 mb-6">
            <h2 className="text-2xl font-black text-gray-800 text-center">{question.questionText}</h2>
          </div>

          {gameState === 'waiting' && (
            <div className="text-center text-white text-2xl font-black">Bekle...</div>
          )}

          {gameState === 'question' && !answered && (
            <div className="grid grid-cols-2 gap-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => playerSubmitAnswer(idx)}
                  className={`${COLORS[idx]} text-white p-8 rounded-2xl text-2xl font-black hover:scale-105 cursor-pointer`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {answered && (
            <div className={`text-center text-3xl font-black p-8 rounded-2xl ${
              selectedAnswer === question.correctAnswerIndex ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
              {selectedAnswer === question.correctAnswerIndex ? '✅ DOĞRU!' : '❌ YANLIŞ!'}
            </div>
          )}

          <div className="mt-8 bg-white/20 rounded-3xl p-6">
            <h3 className="text-white text-2xl font-black mb-4">Top 5</h3>
            <div className="space-y-2">
              {players.slice(0, 5).map((p, idx) => (
                <div key={p.id} className={`flex justify-between items-center p-3 rounded-lg font-bold ${
                  p.id === playerId ? 'bg-yellow-300 text-gray-800' : 'bg-white/20 text-white'
                }`}>
                  <span>{idx + 1}. {p.name}</span>
                  <span>{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}