<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatbotController extends Controller
{
    // FAQ-based chatbot for nutrition questions
    private array $faqs = [
        'proteína'        => 'La proteína es esencial para construir y reparar músculo. Se recomienda entre 1.6-2.2g por kg de peso corporal para deportistas.',
        'carbohidratos'   => 'Los carbohidratos son tu principal fuente de energía. No los elimines; elige integrales y en cantidades ajustadas a tu actividad.',
        'grasa'           => 'Las grasas saludables (omega-3, aguacate, frutos secos) son necesarias para hormonas y absorción de vitaminas.',
        'calorías'        => 'Para perder peso necesitas un déficit calórico (consumir menos de lo que gastas). Para ganar músculo, un superávit moderado de 200-300 kcal.',
        'agua'            => 'Bebe al menos 35ml por kg de peso al día, más si entrenas. La hidratación afecta directamente al rendimiento.',
        'ayuno'           => 'El ayuno intermitente puede ser útil para controlar calorías, pero no es mágico. Lo importante es el balance calórico total.',
        'suplementos'     => 'La creatina y la proteína whey son los suplementos con más evidencia científica. El resto son opcionales.',
        'dieta keto'      => 'La dieta cetogénica puede funcionar para perder grasa, pero no es superior a otras dietas si el déficit calórico es el mismo.',
        'qué comer antes' => 'Antes de entrenar: carbohidratos de digestión media-rápida + proteína. Ej: arroz + pechuga, o plátano + whey.',
        'qué comer después'=> 'Después de entrenar: proteína de calidad + carbohidratos para recuperación. En los siguientes 30-90 minutos.',
    ];

    public function ask(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:500']);
        $message  = mb_strtolower($request->input('message'));

        foreach ($this->faqs as $keyword => $answer) {
            if (str_contains($message, $keyword)) {
                return response()->json([
                    'success' => true,
                    'data'    => ['reply' => $answer, 'type' => 'faq'],
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'reply' => 'No tengo una respuesta específica para eso, pero recuerda: la nutrición óptima se basa en calorías ajustadas a tu objetivo, suficiente proteína (1.6-2g/kg), y alimentos mayoritariamente integrales. Consulta con un dietista para un plan personalizado.',
                'type'  => 'default',
            ],
        ]);
    }
}
