var awsConfig = {
    regionName : 'us-east-1',
    userPoolId : 'us-east-1_xj6SEtAyE',
    clientId : '30r03gkfc6s448eqgrautmdmj9',
    identityPoolId : 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    samlIdpArn: 'arn:aws:iam::<aws-account-no>:saml-provider/cognito-s3-saml',
    relayingPartyId: 'cognito-s3-internal',
    adfsUrl: 'https://<adfs-server-ip>/adfs/ls/IdpInitiatedSignOn.aspx',
    adfsLogoutUrl: 'https://<adfs-server-ip>/adfs/ls/?wa=wsignout1.0',
    roleSelectedArn: 'arn:aws:iam::<aws-account-no>:role/ADFS-Readonly',
    bucket: 'perinei-retail'
};

