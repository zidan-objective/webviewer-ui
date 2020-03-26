import core from 'core';
import actions from 'actions';

export default async(certificateUrl, sigWidgets, dispatch) => {
  const doc = core.getDocument();
  if (doc) {
    const verificationResult = await getVerificationResult(doc, sigWidgets, certificateUrl);
    dispatch(actions.setVerificationResult(verificationResult));
  } else {
    window.docViewer.one('documentLoaded', async() => {
      const verificationResult = await getVerificationResult(
        core.getDocument(),
        sigWidgets,
        certificateUrl
      );
      dispatch(actions.setVerificationResult(verificationResult));
    });
  }
};

const getVerificationResult = async(doc, sigWidgets, url) => {
  const { PDFNet } = window;
  const verificationResult = {};

  doc = await doc.getPDFDoc();
  const opts = await PDFNet.VerificationOptions.create(
    PDFNet.VerificationOptions.SecurityLevel.e_compatibility_and_archiving
  );

  await opts.addTrustedCertificateFromURL(url);

  for (const widget of sigWidgets) {
    try {
      const fieldName = widget.getField().name;
      const digitalSigField = await doc.getDigitalSignatureField(fieldName);
      const result = await digitalSigField.verify(opts);
      const id = await (await digitalSigField.getSDFObj()).getObjNum();

      const signed = await digitalSigField.hasCryptographicSignature();
      let signer;
      let signTime;
      if (signed) {
        signer =
          (await digitalSigField.getSignatureName()) || (await digitalSigField.getContactInfo());
        signTime = await digitalSigField.getSigningTime();

        if (await signTime.isValid()) {
          signTime = formatPDFNetDate(signTime);
        } else {
          signTime = null;
        }
      }

      const verificationStatus = await result.getVerificationStatus();
      const documentStatus = await result.getDocumentStatus();
      const digestStatus = await result.getDigestStatus();
      const trustStatus = await result.getTrustStatus();
      const permissionStatus = await result.getPermissionsStatus();
      const disallowedChanges = await Promise.all(
        (await result.getDisallowedChanges()).map(async change => ({
          objnum: await change.getObjNum(),
          type: await change.getTypeAsString(),
        }))
      );

      let trustVerificationResultString;
      let timeOfTrustVerificationEnum;
      let trustVerificationTime;
      const hasTrustVerificationResult = await result.hasTrustVerificationResult();
      if (hasTrustVerificationResult) {
        const trustVerificationResult = await result.getTrustVerificationResult();

        trustVerificationResultString = await trustVerificationResult.getResultString();
        timeOfTrustVerificationEnum = await trustVerificationResult.getTimeOfTrustVerificationEnum();

        trustVerificationTime = await trustVerificationResult.getTimeOfTrustVerification();
        if (trustVerificationTime) {
          trustVerificationTime = formatDate(trustVerificationTime);
        }
      }

      verificationResult[fieldName] = {
        signed,
        signer,
        signTime,
        verificationStatus,
        documentStatus,
        digestStatus,
        trustStatus,
        permissionStatus,
        disallowedChanges,
        trustVerificationResultString,
        timeOfTrustVerificationEnum,
        trustVerificationTime,
        id,
      };
    } catch (e) {
      console.log(e);
    }
  }

  return verificationResult;
};

const formatPDFNetDate = date => {
  const { year, month, day, hour, minute, second } = date;

  return `${year}-${month}-${day}, ${hour}:${minute}:${second}`;
};

const formatDate = epochTime => {
  const date = new Date(0);
  date.setUTCSeconds(epochTime);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    weekday: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};
