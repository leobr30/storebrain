import postgres from 'postgres';

export const onerpDb = postgres(
  'postgres://postgres:p0stgres@192.168.1.104:5432/onerp',
  {
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 30,
    prepare: true,
  },
);

export const onedocDb = postgres(
  'postgres://leo2:LeoDIA17@192.168.1.150:5432/onedoc',
  {
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 20,
  },
);

export const savDb = postgres(
  'postgres://postgres:p0stgres@192.168.1.45:5432/diamantor'
);
