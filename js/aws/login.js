var cognitoUser;

// AGP
// function _getUserIdentityPoolId() {
//     var params = {
//         IdentityPoolId: awsConfig.identityPoolId, /* required */
//         AccountId: awsConfig.accountId,
//         Logins: {
//           'Amazon Cognito user pool': awsConfig.PoolARN,
//           /* '<IdentityProviderName>': ... */
//         }
//       };
//       cognitoidentity.getId(params, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else     console.log(data);           // successful response
//       });
// }

function _makeAWSCredentials(idToken) {
    console.log("_makeAWSCredentials(idToken)");
    var someVar = 'cognito-idp.' + awsConfig.regionName + '.amazonaws.com/' + awsConfig.userPoolId;
    return new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsConfig.identityPoolId,
        Logins: {
            [someVar]: idToken
        }
    });
}


function _makeUserPool() {
    console.log("_makeUserPool()");
    var poolData = {
        UserPoolId: awsConfig.userPoolId,
        ClientId: awsConfig.clientId
    };
    return new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
}



function init() {
    AWS.config.region = awsConfig.regionName;

    // create by Adilson Perinei
    var query = window.location.hash;
    console.log(query);
    myhash = query.replace('#','?');
    var paramters = new URLSearchParams(myhash);

    if (paramters.has('id_token')) {
        console.log(true);
        var idToken = paramters.get('id_token');
        console.log(idToken);
    } else {
        console.log("v1:"+false);
    }

    var idTokenJwt = jwt_decode(idToken);
    console.log(idTokenJwt);
    console.log("email:" + idTokenJwt.email);
    console.log("userpoolid:" + idTokenJwt.sub);

    if (paramters.has('access_token')) {
        console.log(true);
        var access_token = paramters.get('access_token');
        console.log(access_token);
    } else {
        console.log("v1:"+false);
    }

    someVar = 'cognito-idp.' + awsConfig.regionName + '.amazonaws.com/' + awsConfig.userPoolId;

    creds = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsConfig.identityPoolId,
        Logins: {
            [someVar]: idToken
        }
    });

    AWS.config.region = awsConfig.regionName;
    AWS.config.credentials = creds;
    console.log('---------Identity ID --------------')
    console.log(AWS.config.credentials.identityId);
    console.log(AWS.config.credentials.cognitoUser);

    creds.get(function (err) {
        if (!err) {
            console.log("returned without error"); // <-- this gets called!!!

            // and the values are correctly set!
            var accessKeyId = AWS.config.credentials.accessKeyId;
            var secretAccessKey = AWS.config.credentials.secretAccessKey;
            var sessionToken = AWS.config.credentials.sessionToken;
            console.log(accessKeyId);
            console.log(secretAccessKey);
            console.log(sessionToken);
            // cognitoUser = idTokenJwt.sub;
            cognitoUser = AWS.config.credentials.identityId;
            

            // Load cognito User from local storage
            var userPool = _makeUserPool();
            console.log("userPool:" + userPool);
            cognitoUser1 = userPool.getCurrentUser();
            console.log("cognitoUser1: " + cognitoUser1);

            console.log("call show S3 content");
            showS3BucketContents();
            // _getUserIdentityPoolId();

        }
        else{
            console.log("returned with error"); // <-- might get called if something is missing, anyways self-descriptive. 
            console.log(err);
        }
    });








    // // If not Found, show login page
    // if (cognitoUser == null) {
    //     showLoginDiv(true);
    //     showMenuDiv(false);
    //     return;
    // }


    // // Load Session from Local storage if found
    // cognitoUser.getSession(function(err, session) {
    //     if (err) {
    //         alert(err);
    //         return;
    //     }

    //     console.log('session validity: ' + session.isValid());
    //     console.log('ID Token: ' + session.idToken.jwtToken);

    //     // Set Credentials within AWS Config to access other AWS services
    //     var idToken = session.idToken.jwtToken;
    //     AWS.config.credentials = _makeAWSCredentials(idToken);
    //     console.log(AWS.config.credentials)

    //     // Refresh the credentials - in case the session has expired
    //     AWS.config.credentials.get(function(err) {
    //         if (err) {
    //             alert(err);
    //         }
    //     });
    // });
    // _enableMfa();
    // // if user is logged IN, show Menu
    // showMenuDiv(true);
    // showLoginDiv(false);
}


function checkHash(hash, newHash, userName, password) {
    if (hash === newHash) {
        _loginToAWS(userName, password);
    } else {
        showUnauthorizedMenuDiv(true);
        showUnauthMenuDiv(false);
        showUnauthLoginDiv(false);
        showAuthLoginDiv(false);
        showAuthMenuDiv(false);
    }

}

function getUrlHash(url) {
    if (!url) url = window.location.href;
    var hashurl = url.split("&hash=");
    var mylasturl = hashurl[1];
    var mynexturl = mylasturl.split("&");
    var hash = mynexturl[0];
    return hash;
}

function onLogin() {
    var auth = getParameterByName('auth');
    var userNameFld = document.getElementById('userName');
    var userName = userNameFld.value;
    var passwordFld = document.getElementById('password');
    var password = passwordFld.value;
    var key = getParameterByName('key');
    if (auth == 'true' || auth == 'false') {
        var hash = getUrlHash();
        var newHash = createHmac(userName, key);
        console.log("oldHash: ", hash);
        console.log("newHash: ", newHash);
        checkHash(hash, newHash, userName, password);
    } else {
        clearLoginError();
        disableButton('loginButton');

        if (userNameFld === null || passwordFld === null) {
            alert('Programmatic Error. User Name or Password Field is not configured properly');
            return;
        }

        // Now Login to AWS
        _loginToAWS(userName, password);
    }
}



function _loginToAWS(userName, password) {
    var userPool = _makeUserPool();
    var userData = {
        Username: userName,
        Pool: userPool
    };
    cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    var authenticationData = {
        Username: userName,
        Password: password,
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);


    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: _callbackOnAWSLoginSuccess,
        onFailure: _callbackOnAWSLoginFailure,
        newPasswordRequired: _callbackOnAWSForcePasswdChange,
        mfaRequired: function(codeDeliveryDetails) {
            var verificationCode = prompt('Please input verification code sent via SMS', '');
            cognitoUser.sendMFACode(verificationCode, this);
        }
    });

}


function _callbackOnAWSLoginSuccess(result) {
    console.log('access token + ' + result.getAccessToken().getJwtToken());
    /*Use the idToken for Logins Map when Federating User Pools with Cognito Identity or when passing through an Authorization Header to an API Gateway Authorizer*/
    console.log('idToken + ' + result.idToken.jwtToken);

    idToken = result.idToken.jwtToken;
    AWS.config.credentials = _makeAWSCredentials(idToken);

    var auth = getParameterByName('auth');

    setTimeout(function() {
        enableButton('loginButton', 'Sign in');

        if (auth == 'true' || auth == 'false') {
            showUnauthMenuDiv(false);
            showUnauthLoginDiv(false);
            showAuthLoginDiv(false);
            showAuthMenuDiv(true);
            showUnauthorizedMenuDiv(false);
            text = '<button onclick="downloadObject()">Download File</button>'
            document.getElementById("output").innerHTML = text
        } else {
            showMenuDiv(true);
            showLoginDiv(false)
        }

    }, 100);
}



function _callbackOnAWSLoginFailure(err) {
    console.log("Failure: ");
    setLoginErrorMessge(err);
    enableButton('loginButton', 'Sign in');
}



// TODO: Improve this by asking for modified password
function _callbackOnAWSForcePasswdChange(userAttributes, requiredAttributes) {
    // User was signed up by an admin and must provide new
    // password and required attributes, if any, to complete
    // authentication.

    // userAttributes: object, which is the user's current profile. It will list all attributes that are associated with the user.
    // Required attributes according to schema, which don’t have any values yet, will have blank values.
    // requiredAttributes: list of attributes that must be set by the user along with new password to complete the sign-in.

    console.log('User Attributes: ' + userAttributes);
    console.log('Required Attributes: ' + requiredAttributes);

    // Get these details and call
    // newPassword: password that user has given
    // attributesData: object with key as attribute name and value that the user has given.
    cognitoUser.completeNewPasswordChallenge('password123', {}, this)
}




function onLogout() {
    console.log("onLogout()");
    localStorage.clear();
    window.location.replace("https://retail.auth.us-east-1.amazoncognito.com/logout?client_id=30r03gkfc6s448eqgrautmdmj9&response_type=token&scope=aws.cognito.signin.user.admin+email+openid&redirect_uri=http://localhost:8080/view.html");
    // AWS.config.credentials = null;

    // const options = {
    //     method: 'GET'
    // };
    // // console.log('call fetch');
    // endpointCE = 'GET https://retail.auth.us-east-1.amazoncognito.com/logout?client_id=' + awsConfig.clientId +'&logout_uri=https://globo.com';
    // const responseCE = await fetch(endpointCE, options);
    
    
    // if (!responseCE.ok) {
    //     // document.getElementById("submitBTNdiv").innerHTML = '<button class="button" id="submitBTN" onclick="loginFNC()">Submit</button>';
    //     throw Error(responseCE.statusText);
    // } else {
    //     console.log(responseCE);
    // }


    if (cognitoUser == null) {
        alert('user not logged in');
        return;
    }

//     cognitoUser.signOut();
//     cognitoUser = null;
//     showLoginDiv(true);
//     showMenuDiv(false);
//     console.log('Signed Out');
// }

// function registerinit() {
//     showMenuDiv(false);
//     showLoginDiv(true);
//     document.getElementById("register").disabled = true;
}

function register() {
    var userPool = _makeUserPool();

    var attributeList = [];

    var usernameFld = document.getElementById('unauthUsername');
    var username = usernameFld.value;

    var passwordFld = document.getElementById('unauthPassword');
    var password = passwordFld.value;

    var phoneFld = document.getElementById('unauthPhone');
    var phone = phoneFld.value;

    var dataEmail = {
        Name: 'email',
        Value: username
    };
    var dataPhoneNumber = {
        Name: 'phone_number',
        Value: phone
    };
    var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
    var attributePhoneNumber = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhoneNumber);

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);

    userPool.signUp(username, password, attributeList, null, function(err, result) {
        if (err) {
            alert(err);
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());

    });
}

function confirmUser() {
    var usernameFld = document.getElementById('unauthUsername');
    var username = usernameFld.value;
    var codeFld = document.getElementById('confirmcode');
    console.log(codeFld);
    var code = codeFld.value;
    console.log("username: ", username);
    console.log("code: ", code);
    var userPool = _makeUserPool();
    var userData = {
        Username: username,
        Pool: userPool
    };

    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
            alert(err);
            return;
        }
        console.log('call result: ' + result);
    });
    showUnauthLoginDiv(false);
    showUnauthMenuDiv(false);
    showAuthLoginDiv(true);
    showAuthMenuDiv(false);
    showUnauthorizedMenuDiv(false);
}

function _enableMfa() {
    cognitoUser.enableMFA(function(err, result) {
        if (err) {
            alert(err);
            return;
        }
        console.log('call result: ' + result);
    });
}

function authenticateLogin() {
    showUnauthLoginDiv(false);
    showUnauthMenuDiv(false);
    showAuthLoginDiv(true);
    showAuthMenuDiv(false);
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function authenticationInit() {
    var auth = getParameterByName('auth');
    console.log(auth);
    if (auth == 'false') {
        showUnauthLoginDiv(true);
        showUnauthMenuDiv(false);
        showAuthLoginDiv(false);
        showAuthMenuDiv(false);
        showUnauthorizedMenuDiv(false);
    }
    if (auth == 'true') {
        showUnauthLoginDiv(false);
        showUnauthMenuDiv(false);
        showAuthLoginDiv(true);
        showAuthMenuDiv(false);
        showUnauthorizedMenuDiv(false);
    }
}
