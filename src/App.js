import React, { useState } from 'react';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);  // 用户上传的图片
  const [resultImage, setResultImage] = useState(null);      // 接口返回的base64图片
  const [resultText, setResultText] = useState('');          // 接口返回的result文本
  const [loading, setLoading] = useState(false);             // 加载状态

  // 处理图片上传
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 模拟调用接口（替换为实际的API调用）
  const handleRecognition = () => {
    setLoading(true);
    
    // 模拟API返回数据
    const mockApiResponse = {
      image: {
        base64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",  // 示例 base64 图片
      },
      result: "This is a recognition result."  // 示例返回文本
    };

    // 模拟网络请求
    setTimeout(() => {
      setLoading(false);
      setResultImage(mockApiResponse.image.base64);
      setResultText(mockApiResponse.result);
    }, 1500); // 模拟1.5秒的延迟
  };

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '20px' }}>
      {/* 左侧部分：上传图片 */}
      <div style={{ flex: 1, paddingRight: '20px' }}>
        <h2>上传图片</h2>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <div style={{ margin: '20px 0' }}>
          {selectedImage && (
            <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%', height: 'auto' }} />
          )}
        </div>
        <button onClick={handleRecognition} disabled={!selectedImage || loading}>
          {loading ? '识别中...' : '识别'}
        </button>
      </div>

      {/* 右侧部分：显示识别后的结果 */}
      <div style={{ flex: 1, paddingLeft: '20px', borderLeft: '1px solid #ccc' }}>
        <h2>识别结果</h2>
        <div style={{ marginBottom: '20px' }}>
          {resultImage ? (
            <img src={resultImage} alt="Result" style={{ maxWidth: '100%', height: 'auto' }} />
          ) : (
            <p>识别后的图片将显示在这里</p>
          )}
        </div>
        <div>
          <textarea
            value={resultText}
            readOnly
            style={{ width: '100%', height: '100px', padding: '10px', resize: 'none' }}
            placeholder="识别结果文本将显示在这里"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
