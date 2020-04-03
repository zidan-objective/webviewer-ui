import core from 'core';
import actions from 'actions';

export default async(certificate, sigWidgets, dispatch) => {
  const doc = core.getDocument();
  if (doc) {
    const verificationResult = await getVerificationResult(doc, sigWidgets, certificate);
    dispatch(actions.setVerificationResult(verificationResult));
  } else {
    window.docViewer.one('documentLoaded', async() => {
      const verificationResult = await getVerificationResult(
        core.getDocument(),
        sigWidgets,
        certificate
      );
      dispatch(actions.setVerificationResult(verificationResult));
    });
  }
};

const getVerificationResult = async(doc, sigWidgets, certificate) => {
  const { PDFNet } = window;
  const { VerificationResult } = PDFNet;
  // const { TimeMode } = VerificationOptions;
  const {
    TrustStatus,
    DigestStatus,
    ModificationPermissionsStatus,
    DocumentStatus,
  } = VerificationResult;
  const verificationResult = {};

  doc = await doc.getPDFDoc();
  const opts = await PDFNet.VerificationOptions.create(
    PDFNet.VerificationOptions.SecurityLevel.e_compatibility_and_archiving
  );

  if (typeof certificate === 'string') {
    await opts.addTrustedCertificateFromURL(certificate);
  } else if (
    certificate instanceof File ||
    Object.prototype.toString.call(certificate) === '[object File]'
  ) {
    const fileReader = new FileReader();
    const arrayBufferPromise = new Promise((resolve, reject) => {
      fileReader.addEventListener('load', async e => {
        resolve(new Uint8Array(e.target.result));
      });
      fileReader.addEventListener('error', () => {
        reject('Error reading the local certificate');
      });

      fileReader.readAsArrayBuffer(certificate);
    });

    await opts.addTrustedCertificate(await arrayBufferPromise);
  }

  for (const widget of sigWidgets) {
    try {
      const fieldName = widget.getField().name;
      const digitalSigField = await doc.getDigitalSignatureField(fieldName);
      const result = await digitalSigField.verify(opts);
      const id = await (await digitalSigField.getSDFObj()).getObjNum();

      const signed = await digitalSigField.hasCryptographicSignature();
      let signer;
      let signTime;
      let documentPermission;
      let isCertification;
      if (signed) {
        signer =
          (await digitalSigField.getSignatureName()) || (await digitalSigField.getContactInfo());
        signTime = await digitalSigField.getSigningTime();

        if (await signTime.isValid()) {
          signTime = formatPDFNetDate(signTime);
        } else {
          signTime = null;
        }

        documentPermission = await digitalSigField.getDocumentPermissions();
        isCertification = await digitalSigField.isCertification();
      }

      const verificationStatus = await result.getVerificationStatus();
      const documentStatus = await result.getDocumentStatus();
      const digestStatus = await result.getDigestStatus();
      const trustStatus = await result.getTrustStatus();
      const permissionStatus = await result.getPermissionsStatus();
      const digestAlgorithm = await result.getSignersDigestAlgorithm();
      const disallowedChanges = await Promise.all(
        (await result.getDisallowedChanges()).map(async change => ({
          objnum: await change.getObjNum(),
          type: await change.getTypeAsString(),
        }))
      );
      const validSignerIdentity = trustStatus === TrustStatus.e_trust_verified;

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
          const date = new Date(0);
          date.setUTCSeconds(trustVerificationTime);
          trustVerificationTime = formatDate(date);
        }
      }

      let badgeIcon;
      if (verificationStatus) {
        badgeIcon = 'digital_signature_valid';
      } else if (
        documentStatus === DocumentStatus.e_no_error &&
        (digestStatus === DigestStatus.e_digest_verified ||
          digestStatus === DigestStatus.e_digest_verification_disabled) &&
        trustStatus !== TrustStatus.e_no_trust_status &&
        (permissionStatus === ModificationPermissionsStatus.e_unmodified ||
          permissionStatus === ModificationPermissionsStatus.e_has_allowed_changes ||
          permissionStatus === ModificationPermissionsStatus.e_permissions_verification_disabled)
      ) {
        badgeIcon = 'digital_signature_warning';
      } else {
        badgeIcon = 'digital_signature_error';
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
        badgeIcon,
        validSignerIdentity,
        digestAlgorithm,
        documentPermission,
        isCertification,
      };
    } catch (e) {
      console.log(e);
    }
  }

  return verificationResult;
};

const formatPDFNetDate = pdfnetDate => {
  const twoDigits = number => `0${number}`.slice(-2);

  const { year, month, day, hour, minute, second, UT, UT_hour, UT_minutes } = pdfnetDate;
  let dateString = `${year}-${twoDigits(month)}-${twoDigits(day)}T${twoDigits(hour)}:${twoDigits(
    minute
  )}:${twoDigits(second)}.000`;
  if (!UT || UT === 90) {
    // UT === Z
    dateString += 'Z';
  } else if (UT === 45) {
    dateString += `-${twoDigits(UT_hour)}:${twoDigits(UT_minutes)}`;
  } else if (UT === 43) {
    dateString += `+${twoDigits(UT_hour)}:${twoDigits(UT_minutes)}`;
  }
  const time = Date.parse(dateString);
  const date = new Date();
  date.setTime(time);

  return formatDate(date);
};

const formatDate = date => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    weekday: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
};
