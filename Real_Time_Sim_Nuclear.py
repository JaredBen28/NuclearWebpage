# -*- coding: utf-8 -*-
"""
Created on Sun Nov  6 11:10:45 2022

@author: mikey
"""

# Libary Importations
import numpy as np
import matplotlib.pyplot as plt 

import time
import simpy

xCurrent = []
# References
beta1 = 0.01
beta2 = 0.02
beta3 = 0.03
beta4 = 0.04
beta5 = 0.05
beta6 = 0.06
lam1 = 1
alpha = 0.01
tau = 1
K = 1
Kp = 0.3
Ki = 0
Tc = -1


def step(magnitude, time, delay):
    
    if time > delay:
        x = magnitude
    else:
        x = 0
        
    return x

def xprime(env, interval):
    while True:
        global xCurrent
        #assigning their states to a columns in the matrix 
        t = env.now
        
        n = xCurrent[0]
        C1 = xCurrent[1]
        C2 = xCurrent[2]
        C3 = xCurrent[3]
        C4 = xCurrent[4]
        C5 = xCurrent[5]
        C6 = xCurrent[6]
        T = xCurrent[7]
        k = xCurrent[8]
         
        Tref = step(1,t,10)
        error = Tref - T
    
        #Reactivity dependent on Temperature
        rho = -alpha*T + Kp*(error) + Ki*k
        
        #Differential Equations
        dndt = (rho - beta1)*n + C1*lam1 + C2*lam1 + C3*lam1 + C4*lam1 + C5*lam1 + C6*lam1 
        dc1dt = beta1*n - lam1*C1
        dc2dt = beta2*n - lam1*C2
        dc3dt = beta3*n - lam1*C3
        dc4dt = beta4*n - lam1*C4
        dc5dt = beta5*n - lam1*C5
        dc6dt = beta6*n - lam1*C6
        dTdt = -T/tau + K*n + Tc
        dkdt = Tref - T
         
        # Differential Matrix
        xPrime = [dndt, dc1dt, dc2dt, dc3dt, dc4dt, dc5dt, dc6dt, dTdt, dkdt]
        xMid = [xCurrent[0] + interval * xPrime[0],
                    xCurrent[1] + interval * xPrime[1],
                    xCurrent[2] + interval * xPrime[2],
                    xCurrent[3] + interval * xPrime[3],
                    xCurrent[4] + interval * xPrime[4],
                    xCurrent[5] + interval * xPrime[5],
                    xCurrent[6] + interval * xPrime[6],
                    xCurrent[7] + interval * xPrime[7],
                    xCurrent[8] + interval * xPrime[8]]
        
        #xC + interval * xPrime
        #print(str(xMid))
        print(env.now)
        xCurrent = xMid
        
               
        
       # effemeral = np.array(xCurrent)
       # effemeral.tofile('sample.csv', sep=",")
        f = open("sample.csv", "a")
        f.write(str(xCurrent).replace("[", "").replace("]", ""))
        f.write("\n")
        f.close()
        yield env.timeout(interval) 
        

if __name__ == '__main__':
    xCurrent = [1, beta1/lam1, beta2/lam1, beta3/lam1, beta4/lam1, beta5/lam1, beta6/lam1, 0,0]
    
    env = simpy.rt.RealtimeEnvironment()
    proc = env.process(xprime(env, 0.05))
    
    env.run(until=proc)