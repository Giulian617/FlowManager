# FlowManager

Aplicatia este o platforma de management-ul proiectelor si, implicit, al task-urilor, similara cu aplicatia [Jira](https://www.atlassian.com/software/jira). Aceasta permite companiilor sa creeze mai multe proiecte, pe care sa le asigneze la diverse echipe.

In cadrul proiectelor se pot crea task-uri, care pot fi atribuite utilizatorilor. Managerii au posibilitatea urmarii statusului acestora in timp real si primesc notificari cand acesta se modifica. In caz ca acestia nu sunt multumiti de rezultatul final sau gasesc o problema pot crea un issue, pe care sa-l atribuie utilizatorilor, pentru a-l rezolva. De asemenea, utilizatorii pot lasa comentarii in cadrul task-urilor, pentru a primi clarificari.

Aplicatia ofera si un dashboard interactiv, care permite vizualizarea progresului proiectului prin statistici relevante (task-uri finalizate, in progres, restante), oferind managerilor o imagine de ansamblu asupra evolutiei proiectului.

Pentru o experienta vizuala imbunatatita, aplicatia include si un board de tip Kanban, unde task-urile pot fi gestionate prin drag & drop intre diferite coloane corespunzatoare statusurilor.

# Roluri
Aplicatia contine mai multe roluri:
- Admin: asigura bunul mers al aplicatiei
- Manager: creeaza echipe si task-uri, pe care le atribuie ulterior utilizatorilor
- User: foloseste aplicatia pentru a vedea ce trebuie sa faca si a raporta progresul facut

# Functionalitati principale
- Serviciu de autentificare realizat folosind Keycloak
- Crearea unui proiect si adaugarea echipei care lucreaza la proiect
- Crearea task-urilor si asignarea lor
- Schimbarea statusului unui task
- Adaugarea de comentarii la task-uri
- Dashboard cu statistici si progresul proiectului
- Sistem de notificari, cand se creeaza un task/issue, se lasa un comentariu, etc

# Arhitectura aplicatiei

# Diagram Entitate-Relatie
