#!/usr/bin/python
#-*- coding: utf-8 -*-

# Autor: Krzysztof Czarnecki
# Politechnika Gdańska, Katedra Systemów Geoinformatycznych

# Niniejszy skrypt jest przeznaczony do celów dydaktycznych.
# Stanowi wprowadzenie do automatyzacji operacji wykonywanych w ramach aplikacji Quantum GIS (QGIS).
# UWAGA! Zadania dla studentów znajdują się na końcu niniejszego skryptu.

# W pierwszej kolejności, po wejściu do aplikacji QGIS, należy uruchomić "Konsolę Pythona". 
# Odpowiedni wyzwalacz znajduje się w menu "Wtyczki" lub "Plugins" (w zależności od wersji językowej QGIS).

# Proszę zaimportować moduł sys poleceniem: import sys
# Oraz sprawdzić ścieżki znajdujące się w liście sys.path. Np w ten sposób: print sys.path

# Następnie należy utworzyć dowiązanie symboliczne w jednej z tych lokalizacji. Dowiązanie ma wskazywać niniejszy skrypt.
# W systemie Linux za pośrednictwem powłoki można tego dokonać np. tak: 
#     mkdir -p /home/kafar/.qgis2/python/
#     ln -s  ~/Dydaktyka/PyQGIS/geoi.py ~/.qgis2/python/geoi.py
# *) Można również skopiować niniejszy skrypt do jednej z lokalizacji wskazywanych przez sys.path, lub
# dodać nową lokalizację poleceniem sys.path.append("ścieżka").

# Od tej chwili możliwe jest zaimportowanie modułu o nazwie geoi. Proszę tego dokonać w następujący sposób: import geoi

# Funkcja witająca użytkownika 
def hello():
    print "Hello! This is test lab module!"
# Ten wpis spowoduje, że funkcja hello() uruchomi się przy ładowaniu modułu
hello()
# Ta zmienna wskazywać będzie na katalog z danymi
path = "/home/kafar/laborka/dane/"

# Gdy kod skryptu zostanie zmodyfikowany należy dokonać jego powtórnego importowania za pomocą funkcji wbudowanej reload().
# Funkcję należy wywołać w następujący sposób: reload(geoi)

# Każdą funkcję zdefiniowaną w niniejszym pliku można w konsoli wywoływać niezależnie, poleceniem
# geoi.nazwa_funkcji(), np. geoi.hello()

# Import wymaganych modułów:
import sys, qgis

# Definicja funkcji wypisującej komunikat o błędzie na ekranie (strumień diagnostyczny)
def error(info):
    print >> sys.stderr, "Error:", info


# Demonstracyjna funkcja wczytująca warstwę wektorową z pliku shp:
def polska():
    # ścieżka do pliku shp (może być inna w zależności od systemu plików)
    path_to_poland = path+"POL_adm0.shp"
 
    # wczytanie warstwy jako obiektu vlayer
    vlayer = qgis.core.QgsVectorLayer(path_to_poland, "Polska", "ogr")

    # sprawdzanie poprawności warstwy
    if not vlayer.isValid(): error("Layer failed to load!")

    # Zarejestrowanie warstwy w interfejsie (wyświetlenie jej nastąpi automatycznie):
    qgis.core.QgsMapLayerRegistry.instance().addMapLayer(vlayer)
    # Aby wymusić odrysowanie danej warstwy należy posłużyć się następującymi instrukcjami:
    vlayer.setCacheImage(None)
    vlayer.triggerRepaint() 

    # Zwrócenie obiektu reprezentującego warstwę:
    return vlayer
    # Aby ją przechwycić należy wydać np. następującą instrukcje:
    #    l = poland()
    # lub w zależności od sposobu importowania składników modułu:
    #    l = geoi.poland()


# Analogiczna funkcja wczytująca mapę z podziałem na  powiaty:
def regions():
    path_to_powiaty = path+"POL_adm1.shp" 
    
    # proszę  zwrócić uwagę w jaki sposób obchodzić się z napisami zawierającymi polskie znaki:
    vlayer = qgis.core.QgsVectorLayer(path_to_powiaty, u"Województwa", "ogr") 

    if not vlayer.isValid(): error("Layer failed to load!")
    qgis.core.QgsMapLayerRegistry.instance().addMapLayer(vlayer)
    return vlayer


# Demonstracyjna funkcja usuwająca wczytaną warstwę z interfejsu QGIS:
def remove(layer):
    # Pobranie id warstwy:
    layer_id = layer.id()
 
    # Usunięcie warstwy stosując jej id:
    qgis.core.QgsMapLayerRegistry.instance().removeMapLayer(layer_id)
    # interfejs QGIS powinien odświeżyć się automatycznie

# Demonstracyjna funkcja usuwająca wszystkie wczytane warstwy z interfejsu QGIS:
def clear():
    # iterujemy po wszystkich warstwach w interfejsie
    for item in qgis.core.QgsMapLayerRegistry.instance().mapLayers().items():
        layer_id = item[1].id()
        qgis.core.QgsMapLayerRegistry.instance().removeMapLayer(layer_id)

        # analogicznie można tu użyć funkcji remove zdefiniowanej powyżej: remove(item)


# Demonstracyjna funkcja pozwalająca ustawić przezroczystość wybranej warstwy:
def set_transparency(layer, tval=0.5):
    # Parametr przezroczystość, może przyjmować wartość od 0 do 1.
    if tval<0.0: tval=0
    if tval>1.0: tval=1
    # Ewentualnie można wygenerować komunikat o błędzie!

    # Chcemy mieć przezroczystość a nie nieprzezroczystość:
    tval = 1.0 - tval 

    # Ustawienie przezroczystości warstwy za pomocą obiektów rendererV2 oraz symbol:
    myRenderer = layer.rendererV2()
    mySymbol = myRenderer.symbol()

    # kanał alpha = przezroczystość:
    mySymbol.setAlpha(tval) 

    # odświeżenie warstwy w interfejsie QGIS:
    layer.setCacheImage(None)
    layer.triggerRepaint()

    # To może być nadmiarowe, ale warto znać:
    qgis.utils.iface.mapCanvas().refresh()
    

# Import wymaganych modułów QT:
from PyQt4 import QtGui as qtg
from PyQt4 import QtCore as qtc
# Należy się upewnić czy pythonowe bindy do QT są zainstalowane na komputerze roboczym

# Demonstracyjna funkcja pozwalająca ustawić kolor wybranej warstwy:
# r - red, g - green, b - blue
def set_color(layer, r=0, g=0, b=0):
    # Analogicznie jak to było z kanałem alpha:
    if r<0.0: r=0
    if r>1.0: r=1
    if g<0.0: g=0
    if g>1.0: g=1
    if b<0.0: b=0
    if b>1.0: b=1
    # Przypisanie wielokrotne! Interesująca cecha pythona.
    r,g,b = r*255, g*255, b*255

    # Analogicznie jak to było z kanałem alpha:
    myRenderer = layer.rendererV2()
    mySymbol = myRenderer.symbol()
    
    # Używamy tu komponentów biblioteki QT:
    mySymbol.setColor(qtg.QColor(r,g,b))

    # Odświeżamy interfejs QGIS
    layer.setCacheImage(None)
    layer.triggerRepaint()
    qgis.utils.iface.mapCanvas().refresh()

# Funkcje manipulujące przybliżeniem warstw:
def fix():
    qgis.utils.iface.mapCanvas().zoomToFullExtent()

def zoom(factor=0.5):
    qgis.utils.iface.mapCanvas().zoomByFactor(factor)

def zoom_to_layer(layer):
    layer.selectAll()
    qgis.utils.iface.mapCanvas().zoomToSelected(layer)

# Funkcja pozwala zmienić nazwę warstwy:
def name(layer, name):
    layer.setLayerName(name)
# Przykładowy fragment kodu:
#    l = poland()
#    geoi.name(l, "nowa nazwa")


# Funkcja wczytująca warstwę. Następnie modyfikuje jej przezroczystość i pomniejsza ją 2 razy:
def test():
    l = polska()
    set_transparency(l, 0.2)
    fix()
    zoom(2.0)
    return l

# Ciekawostka!
# W konsoli pythona w QGIS, ostatnią zwracaną wartość można przechwycić za pomocą znaku "_". Np.:
#    import geoi
#    geoi.test()
#    geoi.remove(_)
# Co jest równożnaczne z następującym zapisem:
#    import geoi
#    l = geoi.test()
#    geoi.remove(l)

# Funkcja wypisująca liczbę elementów i atrybutów warstwy wektorowej: 
def numbers(vlayer):
    # Obiekt przechowujące dane o warstwie wektorowej:
    provider = vlayer.dataProvider()

    print "Number of Elements:", provider.featureCount()
    print "Number of Fields:", provider.fields().count()
    
    # Funkcja może zwracać wiele wartości! - kolejna przydatna cecha pythona!
    return provider.featureCount(), provider.fields().count()


# Wypisujemy pola z tablicy argumentów:
def fields(vlayer):

    # Dostawca danych:
    provider = vlayer.dataProvider()
    # Słownik przechowujący obiekty reprezentujące pola (atrybuty):
    ftab = provider.fields()
    
    # Wypisanie nazw pól:
    print "Field names:"
    for f in range(provider.fields().count()): 
        print ftab[f].name()

# Funkcja sprawdzająca jakiego typu jest podawany jako argument obiekt (geometryczny):
def get_geometry_name(feat):

    if feat.geometry() == None: 
        return "Not a shape!"        

    # swich-case, wielo-if:
    if feat.geometry().type() == qgis.core.QGis.Point: return "Point"
    elif feat.geometry().type() == qgis.core.QGis.Line: return "Line"
    elif feat.geometry().type() == qgis.core.QGis.Polygon: return "Polygon"
    elif feat.geometry().type() == qgis.core.QGis.UnknownGeometry: return "Unknown geometry"
    else:  print "Unknown code"

    # obiekt zwracany przez funkcję geometry() przechowuje podstawowe informacje geometryczne np. rozmieszczenie wieszchołków czy powierzchnię poligonu
    # powierzchnię można obliczyć przy pomocy funkcji area()

# Wypisujemy dane z tablicy atrybutów:
def features(vlayer, nr=6):

    # Dostawca danych:
    provider = vlayer.dataProvider()
    
    # Pobranie wszystkich obiektów:
    feature_list = provider.getFeatures()

    # Potrzebujemy wartości True, aby pętla się wykonała:
    feat = qgis.core.QgsFeature()
    
    # Iteracyjne pobieranie informacji o poszczególnych elementach (według konfiguracji dostarczonej przez funkcję select)
    while feature_list.nextFeature(feat):
        print  "Element no. ",feat.id(),":", get_geometry_name(feat)," - reprezentuje ", 

        # Pobranie listy atrybutów danego elementu:
        attrs = feat.attributes()
        print attrs[nr].encode('utf-8')


# Poniższa funkcja przedstawia w jaki sposób można dodać pole do danej warstwy 
# W przykładzie dodano pole typu Double o nazwie "area"
def add_area(vlayer):

    # Włączenie trybu edycji tabeli
    if not vlayer.isEditable():
        vlayer.startEditing()
        print "Start editing!"
    else: print "Editing session already in progress!"

    provider = vlayer.dataProvider()
    caps = provider.capabilities()

    # Dodanie pola oraz wyświetlenie statusu
    if caps & qgis.core.QgsVectorDataProvider.AddAttributes:
        res = vlayer.dataProvider().addAttributes( [ qgis.core.QgsField("area", qtc.QVariant.Double) ] )
        print "Success:",res
    else:
        print "No"

    # Aktualizacja w interfejsie QGIS
    vlayer.commitChanges()


# Poniższa funkcja modyfikuje wartość atrybutu o indeksie 9 (nr) pierwszego elemantu 
def fill_area(vlayer, nr=9):

    # Włączenie trybu edycji tabeli
    if not vlayer.isEditable():
        vlayer.startEditing()
        print "Start editing!"
    else: print "Editing session already in progress!"

    # Zmiana wartości oraz wyświetlenie statusu:
    res = vlayer.changeAttributeValue(0, nr, 72.5)
    print "Success:",res
    vlayer.commitChanges()


# Poniższa funkcja usuwa atrybut o indeksie 9
def del_area(vlayer, nr=9): 

    # Włączenie trybu edycji tabeli
    if not vlayer.isEditable():
        vlayer.startEditing()
        print "Start editing!"
    else: print "Editing session already in progress!"

    # usuwanie atrybutu o indeksie nr
    res = vlayer.deleteAttribute( nr )
    vlayer.commitChanges()
    print "Success:",res

# UWAGA! funkcje add_area, fill_area oraz del_area nie działają na pliku shp tylko na buforze (kopi) w aplikacji QGIS.
# Aby zmodyfikować plik shp należy go nadpisać!

##############################################################################################################################################################
##############################################################################################################################################################
##############################################################################################################################################################

# Zadania Laboratoryjne
        
# Zadanie 1
# Należy napisać skrypt w języku python, który:
# 1. usunie wszystkie warstwy z interfejsu QGIS (jeżeli takie istnieją)
# 2. doda 3 nowe warstwy z plików:
#    - WORLD_RG_10M_2010.shp
#    - POL_adm1.shp
#    - POL_adm2.shp
# 3. nada warstwą	 odpowiednie nazwy, ustawi kolory i przezroczystości tak aby:
#    - był widoczny podział Polski na powiaty oraz województwa (odpowiednia przezroczystość i kolejność warstw)
#    - Polska była zaznaczona innym kolorem, niż reszta państw na mapie
# 4. należy automatycznie ustawić przybliżenie na obszar Polski i jej sąsiadów
# Punktacja: 2.5p


# Zadanie 2
# Naleleży napisać skrypt w pythonie, który automatycznie: 
# 1. usunie wszystkie warstwy z interfejsu QGIS (jeżeli takie istnieją)
# 2. doda nową warstwę wektorową prezentującą podział administracyjny Polski na województwa
# 3. pobierze listę wszystkich województw, obliczy powierzchnię każdego reprezentującego je poligonu i zapisze w pliku łącznie z nazwą województwa (1p)
# 4. utworzy dodatkowe pole o nazwie powierzchnia i wpisze tam wyliczone w poprzednim punkcie wartości (1p)
# Punktacja: 2.5p


