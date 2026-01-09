import sys
import os
from PySide6.QtGui import QGuiApplication
from PySide6.QtQuick import QQuickView
from PySide6.QtCore import QUrl

if __name__ == "__main__":
    app = QGuiApplication(sys.argv)
    
    view = QQuickView()
    view.setTitle("AeroUI Embedded - Basic View")
    view.setResizeMode(QQuickView.SizeRootObjectToView)
    
    qml_file = os.path.join(os.path.dirname(__file__), "qml/MinimalTest.qml")
    view.setSource(QUrl.fromLocalFile(qml_file))
    
    if view.status() == QQuickView.Error:
        print("Error loading QML:")
        for error in view.errors():
            print(error.toString())
        sys.exit(-1)
        
    view.show()
    sys.exit(app.exec())
