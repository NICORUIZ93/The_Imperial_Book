package com.example.restauracion

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                var nota by rememberSaveable { mutableStateOf("") }
                Column(Modifier.padding(24.dp)) {
                    Text("Borrador de entrega")
                    OutlinedTextField(value = nota, onValueChange = { nota = it },
                        label = { Text("Observación") })
                    Text("Texto transitorio; aún no enviado")
                }
            }
        }
    }
}
