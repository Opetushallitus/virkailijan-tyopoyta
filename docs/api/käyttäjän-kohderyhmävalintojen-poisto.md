#Käyttäjän kohderyhmävalintojen poisto

Käyttäjä voi julkaisua tehdessään tallentaa valitsemansa kategoriat, käyttäjäryhmät ja tagit 
kohderyhmävalinnaksi.

Tallennettuja kohderyhmävalintoja poistetaan editorista.

##Endpoint

`DELETE /virkailijan-tyopoyta/api/user/targeting-groups/{id}`

##Ei parametrejä

id: *Pakollinen*. Määrittää, mikä kohderyhmävalinta poistetaan.

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on teksti "OK".

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.
