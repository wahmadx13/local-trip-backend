import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AppConfigService } from '../../common/services/app-config.service';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  inject: [AppConfigService],
  useFactory: (configService: AppConfigService): admin.app.App => {
    if (admin.apps.length > 0) {
      return admin.apps[0]!;
    }

    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: configService.firebaseProjectId,
        privateKey: configService.firebasePrivateKey,
        clientEmail: configService.firebaseClientEmail,
      }),
    });
  },
};
