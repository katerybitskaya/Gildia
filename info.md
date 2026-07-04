# Instrukcja Projektowa dla Agenta AI: Projekt "Roguelite"

> **Kontekst dla Agenta:**
> Jesteś ekspertem gamedevowym (Inżynierem Oprogramowania i Game Designerem). Poniższy dokument opisuje nasz projekt gry. Opieramy się na mechanikach znanych z *The Binding of Isaac* (top-down shooter, proceduralnie generowane pokoje, setki przedmiotów), ale z naszymi unikalnymi zmianami. Twoim zadaniem jest pomoc w [TUTAJ WPISZ ZADANIE DLA AGENTA, np. pisaniu skryptów C# w Unity / projektowaniu synergii przedmiotów / balansowaniu statystyk].

---

## 1. Ogólna Wizja Gry
*   **Tytuł roboczy:** Escape the wsiz
*   **Silnik i technologia:** gra webowa, js (stworz front-end i back-end), docker, react 
*   **Klimat i styl graficzny:** damy swoje grafiki ale przystosuj kod pod wiele grafik i rozdzielczosc; stylistyka bedzie zroznicowana, ui ma byc uniwersalne; wszystkie obrazy pobieraj z .json a my damy tylko sciezke - dodaj komentarze w miejscach gdzie beda potrzebne grafiki
*   **Unikalne** - Pety - lista obiektow, klasa, wyswietlane na boku ekranu miniatury grafiki zwierzakow zmniejszona o np 80%
---

## 2. Mechanika Gracza (Player Controller)
*   **Poruszanie się:** 8 kierunków, top-down, WASD.
*   **Atak podstawowy:** Strzelanie 8 kierunkow tam gdzie patrzy postac; pod spacja
*   **System zdrowia:** pasek HP (np. 100 punktów zdrowia) w lewym gornym rogu 
*   **Podstawowe statystyki do balansowania:**
    *   `Szybkość ruchu`
    *   `Obrażenia (Damage)`
    *   `Szybkostrzelność (Tears/Fire Rate)`
    *   `Szybkość pocisku (Shot Speed)`
    *   `Niesmiertelnosc (true/false)`
    *   `Ilosc pociskow wystrzeliwanych na raz (kazdy ma kat od strony patrzenia) `

---

## 3. Świat i Generowanie Poziomów
*   **Struktura mapy:** Mapa to labirynt skladajacy sie z pokoi; gracz widzi na raz tylko jeden pokoj w ktporym sie znajduje; w pokojach beda znajdowac sie od 1 do 4 drzwi (obiekty jesli postac wejdzie w obiekt przeskakuje do kolejnego pokoju); losowy uklad pokoi domyslnie 10 pokoi i ilosc pokoi zwieksza sie co 5 o poziom; 
*   **Rodzaje pokoi:**
    *   `Zwykłe (znajduje sie tu skrzynka od 0 do 2)`
    *   `Pusty pokoj (startowy znajduje sie tu 1 skrzynka)`
    *   `Boss Room (zamkniety na klucz)` x1 
    *   `Mini boss room (z jednego wypada klucz do Boss Room)` x1(+1 za kazdy poziom do max 5)
*   **Drzwi i blokady:** Drzwi beda jako obrazki / obiekty ktore dodamy pozniej 

---

## 4. Przeciwnicy i Walka
*   **Zachowania wrogów (AI):** "Melee - goni gracza", "Shooter - trzyma dystans i strzela prosto", "Flee - ucieka i zostawia pułapki"
*   **Spawnowanie:** Wrogowie pojawiają się w określonych miejscach (spawn pointach opisanych w jsonie) od razu po wejściu do pokoju 
*   **Bossowie:** Duży pasek zdrowia na dole ekranu ; boss posiada specjalny atak raz na jakis czas strzela kilkoma strzalami naraz lub fala pociskow.

---

## 5. Przedmioty i Synergie (Kluczowy element)
*   **Typy przedmiotów:**
    *   `Pasywne:` Zmieniają statystyki na zawsze lub modyfikują atak, np. pociski odbijają się od ścian; przedmioty beda opisane na jsonach jako clasa
    *   `Consumables (Zużywalne):` Klucz (wypada z minibossow (jesli wiecej to z jednego losowego) do drzwi bossa), leczenie(kotek)
    *   `Pets:` Losowalny ze skrzynki pet opisany na clasie 'pet' jest niesmiertelny i nie atakowalny, nie atakuje przeciwnikow ale pomaga np leczy ; pety musza byc unikalne; chodzi losowo po pokoju i jesli gracz wejdzie w niego daje efekt krtory mozna uzyc n razy gdzie n=lvl peta; peta lvlujesz poprzez kolejne dropniecie ze skrzynki; gracz moze miec tyle petow ile jest petow w grze. 
*   **Zasady tworzenia synergii:** Instrukcja dla Agenta: Gdy proszę cię o pomysł na przedmiot pasywny, zawsze upewnij się, że jego kod/mechanika pozwala na łączenie go z innymi efektami (np. dodanie modyfikatora do listy modyfikatorów ataku); przedmioty maja byc obiektami 

---

## 6. Architektura Kodu i Konwencje (Wypełnij, jeśli Agent ma pisać kod)
*   **Wzorzec projektowy:** Obiektowo, Fabryka abstrakcji
*   **Zarządzanie stanem (State Management):** Używamy Hierarchical State Machine dla przeciwników
*   **Konwencje nazewnictwa:** Zmienne prywatne z podłogą `_myVariable`, klasy PascalCase `MyClass`

