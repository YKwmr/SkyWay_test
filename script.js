let localStream;

// カメラ映像取得
navigator.mediaDevices.getUserMedia({video: true, audio: true})
  .then( stream => {
  // (getUserMediaでstreamオブジェクトを取得)成功時にvideo要素(my-video)にカメラ映像(stream)をセットし、再生
  const videoElm = document.getElementById('my-video');
  videoElm.srcObject = stream;
  videoElm.play();
  // 着信時に相手にカメラ映像を返せるように、グローバル変数に保存しておく
  localStream = stream;
}).catch( error => {
  // 失敗時にはエラーログを出力
  console.error('mediaDevice.getUserMedia() error:', error);
  return;
});

//Peer(通信拠点の単位となるオブジェクト)作成
const peer = new Peer({
  key: '6a386af0-7c78-4a8c-8f73-d602c5cef755',
  debug: 3
});

//PeerID取得
peer.on('open', () => {
  document.getElementById('my-id').textContent = peer.id;
  //document.getElementById('my-id').textContent = "test";
});

// イベントリスナを設置する関数
const setEventListener = mediaConnection => {
  mediaConnection.on('stream', stream => {
    // video要素にカメラ映像をセットして再生
    const videoElm = document.getElementById('their-video')
    videoElm.srcObject = stream;
    videoElm.play();
  });
}
// 発信処理
document.getElementById('make-call').onclick = () => {
  const theirID = document.getElementById('their-id').value;
  //相手のPeerIDと自分のカメラ映像を引数に渡すcallメソッド
  const mediaConnection = peer.call(theirID, localStream);
  //callメソッドで接続して得たMediaConnectionオブジェクトを引数にする
  setEventListener(mediaConnection);
};

//着信処理
peer.on('call', mediaConnection => {
  //callしてきた相手にカメラ映像を返す
  mediaConnection.answer(localStream);
  setEventListener(mediaConnection);
});

//相手との通信が切れたときのcloseイベント
peer.on('close', () => {
  alert('通信が切断しました。');
});

//エラー発生時のイベント
peer.on('error', err => {
  alert(err.message);
});