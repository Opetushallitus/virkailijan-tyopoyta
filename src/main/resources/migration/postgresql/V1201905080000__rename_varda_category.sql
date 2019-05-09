--- OY-284
--- Vardaan liittyvät lisäykset
-- Päivitetään kategorian roolin nimi vastaamaan käyttöoikeuspalveluun lisättyä
UPDATE category SET role = 'APP_VIRKAILIJANTYOPOYTA_VARDA'
  WHERE role =  'APP_VIRKAILIJANTYOPOYTA_VARHAIS';
