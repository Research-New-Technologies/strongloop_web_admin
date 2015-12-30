# Web Admin

<b>Prerequisite</b>
- <b>Git</b>  <br>
  Please install Git to your machine. Visit this [link] (https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) to see how to install git. 
- <b>Nodejs</b><br>
  Download Nodejs and install it to your machine. Visit this [link] (https://nodejs.org/en/download/) to download Nodejs based on your environment.
- <b>Bower</b><br>
  Install Bower into your machine with run bellow command:<br>
  $ npm install bower<br>
- <b>Strongloop</b><br>
  Run the following command in your terminal:
  $ npm install -g strongloop<br>
  *If your environment is windows, please visit this [link](https://docs.strongloop.com/display/SL/Installing+on+Windows) to see step by step how to install Strongloop. Also, add addional command "--unsafe-perm" when install strongloop. ($ npm install -g strongloop --unsafe-perm)<br>

<b>Troubleshooting</b>
- If your environment is Windows and found a problem about NPM behind the proxy, please run the following commands:<br>
  npm config set registry http://registry.npmjs.org/<br>
  npm config set http-proxy http://username:password@ip:port<br>
  npm config set https-proxy http://username:password@ip:port<br>
  npm set strict-ssl false

<b>Run Web Admin in local machine</b><br>
After all Prerequisite components already installed into your machine, please do below steps until Web Admin application is running in your machine.<br>
1. Clone the strongloop_web_admin repository to your machine. (git clone https://github.com/Research-New-Technologies/strongloop_web_admin.git).<br>
2. Change directory into strongloop_web_admin directory. (cd strongloop_web_admin)<br>
3. Install all dependencies (npm install & bower install)<br>
4. Run the application (node .)<br>
5. Go to http://localhost:3000 to see web admin application or to http://localhost:3000/explorer to see Strongloop API explorer.
