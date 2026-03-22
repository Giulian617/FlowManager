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
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/architecture_diagram.png)

Pentru realizarea aplicatiei vom face legatura intre frontend si backend printr-un api gateway care va tine rutele catre celelate microservicii si care va oferi acces utilizatorului daca ii este validat tokenul, acesta este integrat cu keycloak si va verifica daca utilizatorul se afla in realmul specific. Dupa parcurgerea acestuia ajungem la partea de backend care va contine nomenclatorul aplicatiei, un microserviciu care se ocupa cu gestionarea taskurilor, dar si 2 microservicii pentru citire si scriere, acestea sunt separate deoarece folosim cqrs impreuna cu ddd si respectam principiile lor. Am ales sa utilizam kafka care va comunica cu frontend-ul, dar si cu backend-ul. Va exista un serviciu de notificari push cu o baza de date mongo in care se vor salva notificarile daca in kafka se regasesc cu flagul persistent=true. Va exista de asemenea un al doilea modul de notificari care va comunica cu kafka si care va avea scopul de a intercepta mesajele care ajung in acesta si le va emite mai departe catre frontend/backend.

# Diagram Entitate-Relatie
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/entity_relationship_diagram.png)
