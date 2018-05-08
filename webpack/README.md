
## `Webpack` 알아보기

`Webpack`이란 자바스크립트 모듈화 툴이다. 일반적으로 자바스크립트는 언어 자체에서 다른 자바스크립트 파일을 불러오는 기능을 제공하지 않기 때문에 모듈화를 시키는 작업이 따로 필요했다.  

실행 상황에서 다른 자바스크립트 파일을 불러오는 방법도 있지만 이는 네트워크 비용이 많이 들기 때문에 비효율적이다. 이에 애초에 처음부터 모든 모듈 관계를 컴파일해서 하나의 파일로 만드는 방법이 제시되었는데 이게 기술이 바로 `Webpack`이다.

즉, 코딩은 여러 파일로 나눠서 `import` `export`를 사용하는 `es6` 문법으로 편하게 하고 실제로 사용할 땐 `Webpack`을 이용해 하나의 js파일로 묶어서 제공하는 것이다.

### 사용 방법

(설치방법 생략)


1. `webpack.config.js` 설정 파일 만들기

    > webpack.config.js
    ```js
    module.exports = {

      // 다른 js 파일들을 import 하는 시작 js 파일 위치
      entry: './entry.js',

      // 컴파일 후 한 파일로 만든 js 파일을 생성할 위치
      output: {
        path: __dirname,
        filename: 'bundle.js'
      },

      module: {

         // 로더 선택
        loaders: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              exclude: /(node_modules|bower_components)/,
              query: {
                presets: ['es2015']
              }
            }
        ]
      }
    };
    ```


2. 자유롭게 모듈화 된 코드 작성하기

    > entry.js    
    ```js
    import hello from './hello';
    import world from './world';
    document.write(`${hello}, ${world}!`);
    ```

    > hello.js    
    ```js
    export default 'Hello';
    ```

    > world.js    
    ```js
    export default 'world';
    ```


3. 콘솔창에 `webpack` 입력 후 컴파일된 파 사용하기

    > index.html
    ```html
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>

        <!-- 모듈화 관계가 모두 bundle.js 하나의 파일로 컴파일 된다. -->
        <script type="text/javascript" src="bundle.js"></script>
      </body>
    </html>
    ```
