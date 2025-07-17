export async function submitKyc(input: KycEmailInput): Promise<KycSubmissionResult> {
  try {
    const adminDb = getAdminDb();

    // 1. Create the KYC submission document
    const submissionsCollectionRef = collection(adminDb as any, 'kycSubmissions');
    const submissionData = {
        userId: input.userId,
        userName: input.userName,
        userEmail: input.userEmail,
        status: 'pending' as const,
        submittedAt: Timestamp.now(),
    };
    const docRef = await addDoc(submissionsCollectionRef, submissionData);
    
    // 2. Update user's KYC status
    const userDocRef = doc(adminDb as any, 'users', input.userId);
    await updateDoc(userDocRef, {
        kycStatus: 'pending',
        kycSubmittedAt: Timestamp.now(),
        kycSubmissionId: docRef.id, // Lier la soumission à l'utilisateur
    });

    // 3. Send notification email
    const adminEmail = process.env.MAILGUN_ADMIN_EMAIL;
    if (!adminEmail) {
        console.warn('MAILGUN_ADMIN_EMAIL is not set. Skipping admin notification email.');
        return { 
            success: true, 
            message: 'KYC soumis avec succès. La notification par email a été ignorée.' 
        };
    }

    // Validation des fichiers
    const attachments: AttachmentData[] = [];
    
    if (input.idDocument?.data) {
        attachments.push({
            filename: input.idDocument.filename,
            data: Buffer.from(input.idDocument.data.split(",")[1], 'base64')
        });
    }
    
    if (input.proofOfAddress?.data) {
        attachments.push({
            filename: input.proofOfAddress.filename,
            data: Buffer.from(input.proofOfAddress.data.split(",")[1], 'base64')
        });
    }
    
    if (input.selfie?.data) {
        attachments.push({
            filename: input.selfie.filename,
            data: Buffer.from(input.selfie.data.split(",")[1], 'base64')
        });
    }

    const emailSubject = `Nouvelle soumission KYC : ${input.userName}`;
    const emailBody = `
      Une nouvelle soumission KYC est prête pour examen.

      Utilisateur : ${input.userName} (${input.userEmail})
      ID Utilisateur : ${input.userId}
      ID Soumission : ${docRef.id}
      
      ${attachments.length} document(s) joint(s) à cet e-mail.
    `;

    await sendSupportEmail({
      to: adminEmail,
      from: process.env.MAILGUN_FROM_EMAIL || 'kyc@amcbunq.com',
      subject: emailSubject,
      text: emailBody,
      attachment: attachments,
    });

    return {
      success: true,
      message: 'Votre demande de vérification a été envoyée avec succès.',
    };

  } catch (error: any) {
    console.error('Erreur lors du traitement de la soumission KYC:', error);
    
    // Gestion d'erreurs plus spécifique
    if (error.code === 'permission-denied') {
      return {
        success: false,
        message: 'Permissions insuffisantes pour traiter la demande.',
        error: 'Permission refusée',
      };
    }
    
    if (error.code === 'not-found') {
      return {
        success: false,
        message: 'Utilisateur non trouvé.',
        error: 'Utilisateur introuvable',
      };
    }

    return {
      success: false,
      message: 'Une erreur est survenue lors de la soumission de votre demande.',
      error: error.message || 'Une erreur inconnue est survenue.',
    };
  }
}