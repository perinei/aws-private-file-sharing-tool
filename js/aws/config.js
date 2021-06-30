var awsConfig = {
    regionName : 'us-east-1',
    userPoolId : 'us-east-1_xj6SEtAyE',
    clientId : '30r03gkfc6s448eqgrautmdmj9',
    identityPoolId : 'us-east-1:c59f5a04-0d63-428c-b24a-612980714b62',
    samlIdpArn: 'arn:aws:iam::<aws-account-no>:saml-provider/cognito-s3-saml',
    relayingPartyId: 'cognito-s3-internal',
    adfsUrl: 'https://<adfs-server-ip>/adfs/ls/IdpInitiatedSignOn.aspx',
    adfsLogoutUrl: 'https://<adfs-server-ip>/adfs/ls/?wa=wsignout1.0',
    roleSelectedArn: 'arn:aws:iam::<aws-account-no>:role/ADFS-Readonly',
    bucket: 'perinei-retail',
    prefix = 'cognito/retail_app_client/',
    accountId: '498106226372',
    PoolARN: 'cognito-idp:us-east-1:498106226372:userpool/us-east-1_xj6SEtAyE'
};

